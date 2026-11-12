
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { HealthprofileDTO } from '../model/HealthprofileDTO';
 
@Injectable({
  providedIn: 'root',
})
export class Healthprofileservice {
  private apiURL = `${environment.base}/api/healthprofiles`;
 
  constructor(private http: HttpClient) {}
 
  /**
   * Perfil de salud PRINCIPAL del usuario con sesión (el suyo propio).
   *
   * Usa GET /api/healthprofiles/consulta-nativa, que el backend ya filtra por el
   * propietario autenticado. Ese listado incluye también los perfiles de sus familiares,
   * así que el principal es el que tiene como titular (holder) al mismo usuario.
   * Si el usuario solo tiene un perfil, se toma ese. Si no hay ninguno, devuelve null.
   */
  getByOwner(idUser: number): Observable<HealthprofileDTO | null> {
    return this.http.get<HealthprofileDTO[]>(`${this.apiURL}/consulta-nativa`).pipe(
      map(
        (perfiles) =>
          perfiles.find((p) => p.idHolderUser === idUser) ??
          (perfiles.length === 1 ? perfiles[0] : null),
      ),
    );
  }
 
  // POST /api/healthprofiles
  insertHealthProfile(dto: HealthprofileDTO): Observable<HealthprofileDTO> {
    return this.http.post<HealthprofileDTO>(this.apiURL, dto);
  }
 
  // PUT /api/healthprofiles  (el backend recibe el DTO completo con su id)
  updateHealthProfile(dto: HealthprofileDTO): Observable<HealthprofileDTO> {
    return this.http.put<HealthprofileDTO>(this.apiURL, dto);
  }
}