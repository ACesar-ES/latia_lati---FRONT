import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { HealthprofileDTO } from '../model/HealthprofileDTO';

@Injectable({
  providedIn: 'root',
})
export class Healthprofileservice {
  private apiURL = `${environment.base}/health-profiles`; // <-- ajusta a tu controller

  constructor(private http: HttpClient) {}

  // GET /health-profiles/owner/{idUser}  -> perfil de salud del usuario
  getByOwner(idUser: number): Observable<HealthprofileDTO> {
    return this.http.get<HealthprofileDTO>(`${this.apiURL}/owner/${idUser}`);
  }

  insertHealthProfile(dto: HealthprofileDTO): Observable<HealthprofileDTO> {
    return this.http.post<HealthprofileDTO>(this.apiURL, dto);
  }

  updateHealthProfile(dto: HealthprofileDTO): Observable<HealthprofileDTO> {
    return this.http.put<HealthprofileDTO>(this.apiURL, dto);
  }
}
