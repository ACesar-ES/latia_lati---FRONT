import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  DatosFamilia,
  Familyrelationshipservice,
  PerfilFamiliar,
} from '../../../services/familyrelationshipservice';
import { Emergencycontactservice } from '../../../services/emergencycontactservice';
import { EmergencycontactDTO } from '../../../model/EmergencycontactDTO';

// Un familiar dentro del árbol: su perfil y qué es respecto al perfil principal
export interface NodoArbol {
  idRelacion: number;
  perfil: PerfilFamiliar;
  tipo: string;
}

@Component({
  imports: [RouterLink, MatIconModule, MatButtonModule],
  selector: 'app-familylistcomponent',
  styleUrls: ['./familylistcomponent.css', './familytree.css'],
  templateUrl: './familylistcomponent.html',
})
export class Familylistcomponent implements OnInit {
  @ViewChild('lienzo') lienzo?: ElementRef<HTMLElement>;

  datos: DatosFamilia | null = null;
  contactos: EmergencycontactDTO[] = [];
  vista: string = 'arbol'; // arbol | lista
  zoom: number = 1;
  seleccionado: PerfilFamiliar | null = null;

  mensaje: string = '';

  // Filas del árbol según el tipo de relación
  private grupos: Record<string, string[]> = {
    abuelos: ['Abuelo', 'Abuela', 'Abuela materna', 'Abuelo materno', 'Abuela paterna', 'Abuelo paterno'],
    padres: ['Padre', 'Madre', 'Tío', 'Tía', 'Tio', 'Tia'],
    hijos: ['Hijo', 'Hija', 'Sobrino', 'Sobrina', 'Nieto', 'Nieta'],
  };

  constructor(
    private frS: Familyrelationshipservice,
    private ecS: Emergencycontactservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.mensaje = '';
    forkJoin({
      familia: this.frS.cargarFamilia(),
      // HU12 responde 404 si no hay contactos (CA03): se toma como lista vacía
      contactos: this.ecS.list().pipe(catchError((e) => (e.status === 404 ? of([]) : throwError(() => e)))),
    }).subscribe({
      next: (data) => {
        this.datos = data.familia;
        this.contactos = data.contactos;
        this.seleccionado = this.seleccionado ?? data.familia.miPerfil;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener la familia', err);
        this.mensaje = 'Error al obtener las relaciones familiares!!';
        this.cdr.detectChanges();
      },
    });
  }

  // ---------- Árbol ----------
  get familiares(): NodoArbol[] {
    const yo = this.datos?.miPerfil;
    if (!this.datos || !yo) return [];
    return this.datos.relaciones
      .filter((r) => r.idOriginProfile === yo.idHealthProfile)
      .map((r) => ({ idRelacion: r.idFamilyRelationship, perfil: this.perfil(r.idRelativeProfile), tipo: r.relationshipType }));
  }

  fila(grupo: string): NodoArbol[] {
    if (grupo === 'medio') {
      const todos = Object.values(this.grupos).flat();
      return this.familiares.filter((n) => !todos.includes(n.tipo));
    }
    return this.familiares.filter((n) => this.grupos[grupo].includes(n.tipo));
  }

  perfil(id: number): PerfilFamiliar {
    return (
      this.datos?.perfiles.find((p) => p.idHealthProfile === id) ?? {
        idHealthProfile: id, nombre: `Perfil ${id}`, iniciales: 'P' + id, bloodType: '', propio: false, principal: false,
      }
    );
  }

  contactosDe(id: number): EmergencycontactDTO[] {
    return this.contactos.filter((c) => c.idHealthProfile === id);
  }

  resumen(p: PerfilFamiliar): string {
    const n = this.contactosDe(p.idHealthProfile).length;
    const sangre = p.bloodType ? `Sangre ${p.bloodType}` : 'Sin tipo de sangre';
    return `${sangre} · ${n} ${n === 1 ? 'contacto' : 'contactos'}`;
  }

  get zoomTexto(): string {
    return Math.round(this.zoom * 100) + ' %';
  }

  acercar(): void { this.zoom = Math.min(1.4, +(this.zoom + 0.1).toFixed(1)); }
  alejar(): void { this.zoom = Math.max(0.6, +(this.zoom - 0.1).toFixed(1)); }
  pantallaCompleta(): void { this.lienzo?.nativeElement.requestFullscreen?.(); }

  // ---------- Panel lateral ----------
  seleccionar(p: PerfilFamiliar): void {
    this.seleccionado = p;
  }

  get tipoSeleccionado(): string {
    const s = this.seleccionado;
    if (!s) return '';
    if (s.principal) return 'Perfil principal';
    return this.familiares.find((n) => n.perfil.idHealthProfile === s.idHealthProfile)?.tipo ?? 'Familiar';
  }

  get familiaresSeleccionado(): number {
    const id = this.seleccionado?.idHealthProfile;
    return (this.datos?.relaciones ?? []).filter((r) => r.idOriginProfile === id || r.idRelativeProfile === id).length;
  }

  // Contacto principal del perfil elegido (o el primero que tenga)
  get contactoSeleccionado(): EmergencycontactDTO | null {
    const lista = this.contactosDe(this.seleccionado?.idHealthProfile ?? -1);
    return lista.find((c) => c.primaryContact) ?? lista[0] ?? null;
  }

  eliminarRelacion(id: number): void {
    if (!confirm('¿Eliminar esta relación familiar?')) return;

    this.frS.delete(id).subscribe({
      next: () => {
        this.cargarDatos();
      },
      error: (err) => {
        console.log('Ocurrió un error al eliminar la relación', err);
        this.mensaje = 'Error al eliminar!!';
        this.cdr.detectChanges();
      },
    });
  }
}
