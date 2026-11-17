import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { FamilyrelationshipDTO } from '../model/FamilyrelationshipDTO';
import { HealthprofileDTO } from '../model/HealthprofileDTO';
import { UsersResponseDTO } from '../model/UsersResponseDTO';
import { Healthprofileservice } from './healthprofileservice';
import { UsersService } from './usuarioservice';
import type { Kinship } from '../utils/family-tree';

// Perfil de salud con el nombre que se muestra en el árbol
export interface PerfilFamiliar {
  idHealthProfile: number;
  nombre: string;
  iniciales: string;
  bloodType: string;
  propio: boolean; // es un perfil del usuario con sesión (su dueño)
  principal: boolean; // es el perfil del propio usuario (titular = usuario con sesión)
}

// Todo lo que necesita la pantalla de Familia, en una sola carga
export interface DatosFamilia {
  usuario: UsersResponseDTO | null;
  perfiles: PerfilFamiliar[]; // todos los perfiles, con nombre
  relaciones: FamilyrelationshipDTO[]; // relaciones donde participa algún perfil propio
  idsFamilia: number[]; // perfiles propios + los perfiles relacionados con ellos
  miPerfil: PerfilFamiliar | null;
}

@Injectable({
  providedIn: 'root',
})
export class Familyrelationshipservice {
  private apiURL = `${environment.base}/api/familyrelationships`;

  constructor(
    private http: HttpClient,
    private hpS: Healthprofileservice,
    private uS: UsersService,
  ) {}

  // HU47: GET /api/familyrelationships
  list(): Observable<FamilyrelationshipDTO[]> {
    return this.http.get<FamilyrelationshipDTO[]>(this.apiURL);
  }

  // HU46: POST /api/familyrelationships
  insert(fr: FamilyrelationshipDTO): Observable<FamilyrelationshipDTO> {
    return this.http.post<FamilyrelationshipDTO>(this.apiURL, fr);
  }

  // HU48: GET /api/familyrelationships/{id}
  listId(id: number): Observable<FamilyrelationshipDTO> {
    return this.http.get<FamilyrelationshipDTO>(`${this.apiURL}/${id}`);
  }

  // HU49: PUT /api/familyrelationships/{id}
  update(fr: FamilyrelationshipDTO): Observable<FamilyrelationshipDTO> {
    return this.http.put<FamilyrelationshipDTO>(`${this.apiURL}/${fr.idFamilyRelationship}`, fr);
  }

  // HU50: DELETE /api/familyrelationships/{id}
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  // HU73: GET /api/familyrelationships/perfil/{healthProfileId}
  listByProfile(idHealthProfile: number): Observable<FamilyrelationshipDTO[]> {
    return this.http.get<FamilyrelationshipDTO[]>(`${this.apiURL}/perfil/${idHealthProfile}`);
  }

  /**
   * Junta perfiles, usuarios y relaciones para la pantalla de Familia.
   * El nombre de un perfil sale de su titular (holder); si no tiene, se muestra "Perfil N".
   */
  cargarFamilia(): Observable<DatosFamilia> {
    return forkJoin({
      usuario: this.uS.cargarUsuarioActual().pipe(catchError(() => of(null))),
      perfiles: this.hpS.list().pipe(catchError(() => of([] as HealthprofileDTO[]))),
      usuarios: this.uS.getUsers().pipe(catchError(() => of([] as UsersResponseDTO[]))),
      relaciones: this.list(),
    }).pipe(
      map((d) => {
        const idUsuario = d.usuario?.idUser ?? -1;
        const perfiles: PerfilFamiliar[] = d.perfiles.map((p) => {
          const titular = d.usuarios.find((u) => u.idUser === p.idHolderUser);
          const nombre = titular ? `${titular.firstName} ${titular.lastName}`.trim() : `Perfil ${p.idHealthProfile}`;
          return {
            idHealthProfile: p.idHealthProfile,
            nombre,
            iniciales: titular
              ? ((titular.firstName?.charAt(0) ?? '') + (titular.lastName?.charAt(0) ?? '')).toUpperCase()
              : 'P' + p.idHealthProfile,
            bloodType: p.bloodType ?? '',
            propio: p.idOwnerUser === idUsuario,
            principal: p.idHolderUser === idUsuario,
          };
        });

        const propios = perfiles.filter((p) => p.propio).map((p) => p.idHealthProfile);
        const relaciones = d.relaciones.filter(
          (r) => propios.includes(r.idOriginProfile) || propios.includes(r.idRelativeProfile),
        );
        const idsFamilia = Array.from(
          new Set([...propios, ...relaciones.flatMap((r) => [r.idOriginProfile, r.idRelativeProfile])]),
        );
        const miPerfil =
          perfiles.find((p) => p.principal) ?? perfiles.find((p) => p.propio) ?? null;

        return { usuario: d.usuario, perfiles, relaciones, idsFamilia, miPerfil };
      }),
    );
  }
}

// Servicio de la rama de Aixa (árbol y selector de perfil): ver y crear vínculos
@Injectable({ providedIn: 'root' })
export class FamilyRelationshipService {
  private readonly url = environment.base + '/api/familyrelationships';
  constructor(private http: HttpClient) {}
  byProfile(id: number): Observable<FamilyrelationshipDTO[]> {
    return this.http.get<FamilyrelationshipDTO[]>(this.url + '/perfil/' + id);
  }
  create(
    origin: number,
    relative: number,
    relationship: Kinship,
  ): Observable<FamilyrelationshipDTO> {
    return this.http.post<FamilyrelationshipDTO>(this.url, {
      idOriginProfile: origin,
      idRelativeProfile: relative,
      relationshipType: relationship,
    });
  }
}
