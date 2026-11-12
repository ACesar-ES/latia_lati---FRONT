import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { EmergencycontactDTO } from '../model/EmergencycontactDTO';
 
@Injectable({
  providedIn: 'root',
})
export class Emergencycontactservice {
  private apiURL = `${environment.base}/api/emergencycontacts`;
 
  constructor(private http: HttpClient) {}
 
  /**
   * Contactos de un perfil de salud.
   * Tu backend todavía no tiene un endpoint por perfil, así que pedimos la lista completa
   * y filtramos aquí. Si no hay ningún contacto, el backend responde 404 (CA03):
   * los componentes ya lo tratan como lista vacía con catchError.
   */
  getByProfile(idHealthProfile: number): Observable<EmergencycontactDTO[]> {
    return this.http
      .get<EmergencycontactDTO[]>(this.apiURL)
      .pipe(map((lista) => lista.filter((c) => c.idHealthProfile === idHealthProfile)));
  }
 
  // POST /api/emergencycontacts
  insertContact(dto: EmergencycontactDTO): Observable<EmergencycontactDTO> {
    return this.http.post<EmergencycontactDTO>(this.apiURL, dto);
  }
 
  // PUT /api/emergencycontacts/{id}  (tu controller exige el id en la URL)
  updateContact(dto: EmergencycontactDTO): Observable<EmergencycontactDTO> {
    return this.http.put<EmergencycontactDTO>(`${this.apiURL}/${dto.idEmergencyContact}`, dto);
  }
}