import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { EmergencycontactDTO } from '../model/EmergencycontactDTO';
import { EmergencycardDTO } from '../model/EmergencycardDTO';
import { CountemergencycontactsbyrelationshipDTO } from '../model/CountemergencycontactsbyrelationshipDTO';
import { CountemergencycontactsbyprofileDTO } from '../model/CountemergencycontactsbyprofileDTO';

@Injectable({
  providedIn: 'root',
})
export class Emergencycontactservice {
  private apiURL = `${environment.base}/api/emergencycontacts`;

  constructor(private http: HttpClient) {}

  // HU12: GET /api/emergencycontacts (responde 404 cuando no hay registros, CA03)
  list(): Observable<EmergencycontactDTO[]> {
    return this.http.get<EmergencycontactDTO[]>(this.apiURL);
  }

  /**
   * Contactos de un perfil de salud (lo usa la pantalla de perfil).
   * El backend no tiene un endpoint por perfil, así que se pide la lista completa
   * y se filtra aquí. Si no hay ningún contacto, el backend responde 404 (CA03):
   * los componentes lo tratan como lista vacía con catchError.
   */
  getByProfile(idHealthProfile: number): Observable<EmergencycontactDTO[]> {
    return this.list().pipe(map((lista) => lista.filter((c) => c.idHealthProfile === idHealthProfile)));
  }

  // HU11: POST /api/emergencycontacts
  insertContact(dto: EmergencycontactDTO): Observable<EmergencycontactDTO> {
    return this.http.post<EmergencycontactDTO>(this.apiURL, dto);
  }

  // HU13: GET /api/emergencycontacts/{id}
  listId(id: number): Observable<EmergencycontactDTO> {
    return this.http.get<EmergencycontactDTO>(`${this.apiURL}/${id}`);
  }

  // HU14: PUT /api/emergencycontacts/{id}  (el controller exige el id en la URL)
  updateContact(dto: EmergencycontactDTO): Observable<EmergencycontactDTO> {
    return this.http.put<EmergencycontactDTO>(`${this.apiURL}/${dto.idEmergencyContact}`, dto);
  }

  // HU15: DELETE /api/emergencycontacts/{id}
  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  // HU68 (consulta simple): GET /api/emergencycontacts/principales
  listPrincipales(): Observable<EmergencycontactDTO[]> {
    return this.http.get<EmergencycontactDTO[]>(`${this.apiURL}/principales`);
  }

  // HU69 (consulta nativa con JOIN): GET /api/emergencycontacts/fichas
  listFichas(): Observable<EmergencycardDTO[]> {
    return this.http.get<EmergencycardDTO[]>(`${this.apiURL}/fichas`);
  }

  // Reporte: GET /api/emergencycontacts/reporte/parentescos
  getCountByRelationship(): Observable<CountemergencycontactsbyrelationshipDTO[]> {
    return this.http.get<CountemergencycontactsbyrelationshipDTO[]>(`${this.apiURL}/reporte/parentescos`);
  }

  // Reporte: GET /api/emergencycontacts/reporte/perfiles
  getCountByProfile(): Observable<CountemergencycontactsbyprofileDTO[]> {
    return this.http.get<CountemergencycontactsbyprofileDTO[]>(`${this.apiURL}/reporte/perfiles`);
  }
}
