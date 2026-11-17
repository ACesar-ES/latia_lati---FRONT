import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError, forkJoin, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { UsersService } from './usuarioservice';
import { Loginservice } from './loginservice';
import { Healthprofileservice } from './healthprofileservice';
import { Familyrelationshipservice } from './familyrelationshipservice';
import { HealthprofileDTO } from '../model/HealthprofileDTO';
import { UsersResponseDTO } from '../model/UsersResponseDTO';
import { FamilyrelationshipDTO } from '../model/FamilyrelationshipDTO';

// Parentescos que se pueden elegir al agregar un familiar
export const PARENTESCOS = ['Madre', 'Padre', 'Hija', 'Hijo'];

/**
 * Guarda los perfiles de la cuenta, sus vínculos y el perfil elegido ("perfil activo").
 * Lo usan Familia, Cambiar perfil, el menú y el Historial, para que todos muestren
 * el mismo perfil sin volver a pedir los datos en cada pantalla.
 */
@Injectable({
  providedIn: 'root',
})
export class Familycontextservice {
  fase: 'inactivo' | 'cargando' | 'listo' | 'error' | 'sinSesion' = 'inactivo';
  cuenta: UsersResponseDTO | null = null;
  perfiles: HealthprofileDTO[] = [];
  vinculos: FamilyrelationshipDTO[] = [];
  private nombres: Record<number, string> = {}; // nombre del titular de cada perfil
  private alias: Record<number, string> = {}; // nombre de uso de perfiles sin titular
  private seleccionado: number | null = null;
  private sesion = ''; // token con el que se cargaron los datos
  private peticion?: Observable<void>;

  constructor(
    private uS: UsersService,
    private lS: Loginservice,
    private hpS: Healthprofileservice,
    private frS: Familyrelationshipservice,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  // ---------- Carga ----------

  // Carga perfiles y vínculos una sola vez por sesión (forzar = volver a pedirlos)
  cargar(forzar: boolean = false): Observable<void> {
    // En el servidor (SSR) no hay token: la carga se hace en el navegador
    if (!isPlatformBrowser(this.platformId)) return of(undefined);

    const token = this.lS.getToken() ?? '';
    if (!token) {
      this.limpiar(true);
      this.fase = 'sinSesion';
      return of(undefined);
    }
    if (token !== this.sesion) {
      // Cambió la cuenta: se borra lo de la sesión anterior
      this.limpiar(!!this.sesion);
      this.sesion = token;
    } else if (!forzar) {
      if (this.fase === 'listo') return of(undefined);
      if (this.fase === 'cargando' && this.peticion) return this.peticion;
    }

    this.fase = 'cargando';
    this.peticion = this.pedirDatos().pipe(
      tap({
        next: (datos) => this.guardarDatos(datos),
        error: () => {
          this.perfiles = [];
          this.vinculos = [];
          this.seleccionado = null;
          this.fase = 'error';
        },
      }),
      map(() => undefined),
      shareReplay(1),
    );
    return this.peticion;
  }

  // Pide la cuenta, sus perfiles, los vínculos de cada perfil y el nombre de cada titular
  private pedirDatos() {
    return this.uS.cargarUsuarioActual().pipe(
      switchMap((cuenta) =>
        this.hpS.listPropios().pipe(
          // GET /consulta-nativa responde 404 cuando no hay perfiles
          catchError((err) => (err.status === 404 ? of([] as HealthprofileDTO[]) : throwError(() => err))),
          switchMap((todos) => {
            const perfiles = todos.filter((p) => p.active && p.idOwnerUser === cuenta.idUser);
            const titulares = [
              ...new Set(
                perfiles.map((p) => p.idHolderUser).filter((id): id is number => !!id && id !== cuenta.idUser),
              ),
            ];
            const vinculos$ = perfiles.length
              ? forkJoin(perfiles.map((p) => this.frS.listByProfile(p.idHealthProfile)))
              : of([] as FamilyrelationshipDTO[][]);
            const nombres$ = titulares.length
              ? forkJoin(
                  titulares.map((id) =>
                    this.uS.listId(id).pipe(
                      map((u) => [id, `${u.firstName} ${u.lastName}`.trim()] as [number, string]),
                      catchError(() => of([id, ''] as [number, string])),
                    ),
                  ),
                )
              : of([] as [number, string][]);
            return forkJoin({ vinculos: vinculos$, nombres: nombres$ }).pipe(
              map((r) => ({ cuenta, perfiles, vinculos: r.vinculos.flat(), nombres: r.nombres })),
            );
          }),
        ),
      ),
    );
  }

  private guardarDatos(datos: {
    cuenta: UsersResponseDTO;
    perfiles: HealthprofileDTO[];
    vinculos: FamilyrelationshipDTO[];
    nombres: [number, string][];
  }): void {
    const ids = datos.perfiles.map((p) => p.idHealthProfile);
    this.cuenta = datos.cuenta;
    this.perfiles = datos.perfiles;
    // Solo vínculos entre perfiles de la cuenta, sin repetir
    this.vinculos = datos.vinculos.filter(
      (v, i, lista) =>
        ids.includes(v.idOriginProfile) &&
        ids.includes(v.idRelativeProfile) &&
        lista.findIndex((x) => x.idFamilyRelationship === v.idFamilyRelationship) === i,
    );
    this.nombres = Object.fromEntries(datos.nombres);

    // Recupera el perfil elegido y los alias guardados en esta pestaña
    const guardado = this.leerPreferencias(datos.cuenta.idUser);
    const alias = { ...guardado.alias, ...this.alias };
    this.alias = {};
    for (const p of datos.perfiles) {
      if (typeof alias[p.idHealthProfile] === 'string') this.alias[p.idHealthProfile] = alias[p.idHealthProfile];
    }
    const elegido = this.seleccionado ?? guardado.activo;
    this.seleccionado = this.esPropio(elegido) ? (elegido as number) : (this.raiz()?.idHealthProfile ?? null);
    this.fase = 'listo';
    this.guardarPreferencias();
  }

  private limpiar(olvidar: boolean): void {
    if (olvidar && this.cuenta) {
      try {
        sessionStorage.removeItem(this.clave(this.cuenta.idUser));
      } catch {}
    }
    this.sesion = '';
    this.cuenta = null;
    this.perfiles = [];
    this.vinculos = [];
    this.nombres = {};
    this.alias = {};
    this.seleccionado = null;
    this.peticion = undefined;
    this.fase = 'inactivo';
  }

  // ---------- Preferencias de la pestaña (sessionStorage) ----------

  private clave(idUsuario: number): string {
    return 'latia.family.tab.' + idUsuario;
  }

  private leerPreferencias(idUsuario: number): { activo?: number; alias?: Record<number, string> } {
    try {
      return JSON.parse(sessionStorage.getItem(this.clave(idUsuario)) || '{}') || {};
    } catch {
      return {};
    }
  }

  private guardarPreferencias(): void {
    if (!this.cuenta) return;
    try {
      sessionStorage.setItem(
        this.clave(this.cuenta.idUser),
        JSON.stringify({ activo: this.seleccionado, alias: this.alias }),
      );
    } catch {}
  }

  // ---------- Perfil activo ----------

  // Perfil propio del usuario (es dueño y titular a la vez)
  raiz(): HealthprofileDTO | null {
    return this.perfiles.find((p) => p.idHolderUser === this.cuenta?.idUser) ?? null;
  }

  activo(): HealthprofileDTO | null {
    return this.perfiles.find((p) => p.idHealthProfile === this.idActivo()) ?? null;
  }

  idActivo(): number | null {
    return this.fase === 'listo' ? this.seleccionado : null;
  }

  esPropio(id: number | null | undefined): boolean {
    return this.perfiles.some((p) => p.idHealthProfile === id);
  }

  seleccionar(id: number): boolean {
    if (this.fase !== 'listo' || this.lS.getToken() !== this.sesion || !this.esPropio(id)) return false;
    this.seleccionado = id;
    this.guardarPreferencias();
    return true;
  }

  // Perfiles con el propio primero y luego por nombre
  ordenados(): HealthprofileDTO[] {
    const idRaiz = this.raiz()?.idHealthProfile;
    return [...this.perfiles].sort(
      (a, b) =>
        Number(b.idHealthProfile === idRaiz) - Number(a.idHealthProfile === idRaiz) ||
        this.nombre(a.idHealthProfile).localeCompare(this.nombre(b.idHealthProfile), 'es'),
    );
  }

  // Agrega a la lista un perfil recién creado (sin volver a pedir todo)
  agregarPerfil(p: HealthprofileDTO, idDueno: number, alias: string): boolean {
    if (!p.idHealthProfile || this.lS.getToken() !== this.sesion || this.cuenta?.idUser !== idDueno) return false;
    if (!this.esPropio(p.idHealthProfile)) {
      this.perfiles = [...this.perfiles, { ...p, idOwnerUser: idDueno, idHolderUser: null, active: true }];
    }
    if (alias.trim()) this.alias[p.idHealthProfile] = alias.trim().slice(0, 80);
    this.guardarPreferencias();
    return true;
  }

  // Agrega a la lista un vínculo recién creado
  agregarVinculo(v: FamilyrelationshipDTO): void {
    if (this.lS.getToken() === this.sesion && this.esPropio(v.idOriginProfile) && this.esPropio(v.idRelativeProfile)) {
      this.vinculos = [...this.vinculos.filter((x) => x.idFamilyRelationship !== v.idFamilyRelationship), v];
    }
  }

  // ---------- Nombres ----------

  nombre(id: number): string {
    const p = this.perfiles.find((x) => x.idHealthProfile === id);
    const u = this.cuenta;
    if (!p) return 'Perfil no disponible';
    if (u && p.idHolderUser === u.idUser) return `${u.firstName} ${u.lastName}`.trim() || 'Mi perfil';
    return (p.idHolderUser && this.nombres[p.idHolderUser]) || this.alias[id] || this.parentesco(id) + ' · perfil ' + id;
  }

  iniciales(id: number): string {
    const palabras = this.nombre(id).split(' · ')[0].trim().split(/\s+/);
    const primera = palabras[0]?.[0] || 'P';
    const ultima = palabras.length > 1 ? palabras[palabras.length - 1][0] : '';
    return (primera + ultima).toUpperCase();
  }

  // Qué es el perfil para el usuario: Madre, Hijo/a, Abuelo/a...
  parentesco(id: number): string {
    const raiz = this.raiz();
    if (!raiz) return 'Perfil administrado';
    if (raiz.idHealthProfile === id) return 'Tú · perfil principal';
    const directo = this.vinculos.find((v) => v.idOriginProfile === raiz.idHealthProfile && v.idRelativeProfile === id);
    if (directo) return directo.relationshipType;
    if (this.cercanos(raiz.idHealthProfile, 'arriba').includes(id)) return 'Progenitor/a';
    if (this.cercanos(raiz.idHealthProfile, 'abajo').includes(id)) return 'Hijo/a';
    if (this.cercanos(raiz.idHealthProfile, 'arriba').some((p) => this.cercanos(p, 'arriba').includes(id))) {
      return 'Abuelo/a';
    }
    return 'Familiar';
  }

  // ---------- Árbol ----------

  // 'arriba' si el tipo es un progenitor, 'abajo' si es un hijo
  private direccion(tipo: string): 'arriba' | 'abajo' | null {
    const valor = tipo.trim().toLowerCase();
    if (['madre', 'padre', 'progenitor'].includes(valor)) return 'arriba';
    if (['hijo', 'hija', 'hijo/a'].includes(valor)) return 'abajo';
    return null;
  }

  // Padres ('arriba') o hijos ('abajo') de un perfil, según los vínculos
  cercanos(id: number, nivel: 'arriba' | 'abajo', vinculos: FamilyrelationshipDTO[] = this.vinculos): number[] {
    const resultado: number[] = [];
    for (const v of vinculos) {
      const d = this.direccion(v.relationshipType);
      if (!d) continue;
      if (v.idOriginProfile === id && d === nivel) resultado.push(v.idRelativeProfile);
      if (v.idRelativeProfile === id && d !== nivel) resultado.push(v.idOriginProfile);
    }
    return [...new Set(resultado)].filter((x) => x !== id).sort((a, b) => a - b);
  }

  // Devuelve un mensaje si el vínculo no se puede crear ('' si está bien)
  problemaVinculo(origen: number, familiar: number, tipo: string, vinculos: FamilyrelationshipDTO[] = this.vinculos): string {
    if (origen === familiar) return 'Una persona no puede ser su propio familiar.';
    const repetido = vinculos.some(
      (v) =>
        (v.idOriginProfile === origen && v.idRelativeProfile === familiar) ||
        (v.idOriginProfile === familiar && v.idRelativeProfile === origen),
    );
    if (repetido) return 'Estos perfiles ya están vinculados.';
    // Evita ciclos: el progenitor no puede ser descendiente del otro perfil
    const progenitor = this.direccion(tipo) === 'arriba' ? familiar : origen;
    const pendientes = [progenitor === familiar ? origen : familiar];
    const vistos: number[] = [];
    while (pendientes.length) {
      const id = pendientes.pop()!;
      if (id === progenitor) return 'Ese vínculo formaría un ciclo en el árbol.';
      if (!vistos.includes(id)) {
        vistos.push(id);
        pendientes.push(...this.cercanos(id, 'abajo', vinculos));
      }
    }
    return '';
  }

  // Cantidad de personas vinculadas a un perfil
  conexiones(id: number): number {
    const otros = this.vinculos
      .filter((v) => v.idOriginProfile === id || v.idRelativeProfile === id)
      .map((v) => (v.idOriginProfile === id ? v.idRelativeProfile : v.idOriginProfile));
    return new Set(otros).size;
  }
}
