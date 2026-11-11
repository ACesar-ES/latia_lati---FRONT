import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { EmergencycontactDTO } from '../model/EmergencycontactDTO';

@Injectable({
  providedIn: 'root',
})
export class Emergencycontactservice {
  private apiURL = `${environment.base}/emergency-contacts`; // <-- ajusta a tu controller

  constructor(private http: HttpClient) {}

  // GET /emergency-contacts/profile/{idHealthProfile}  -> lista de contactos del perfil
  getByProfile(idHealthProfile: number): Observable<EmergencycontactDTO[]> {
    return this.http.get<EmergencycontactDTO[]>(`${this.apiURL}/profile/${idHealthProfile}`);
  }

  insertContact(dto: EmergencycontactDTO): Observable<EmergencycontactDTO> {
    return this.http.post<EmergencycontactDTO>(this.apiURL, dto);
  }

  updateContact(dto: EmergencycontactDTO): Observable<EmergencycontactDTO> {
    return this.http.put<EmergencycontactDTO>(this.apiURL, dto);
  }
}
