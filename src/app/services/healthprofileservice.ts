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

  listOwned(): Observable<HealthprofileDTO[]> {
    return this.http.get<HealthprofileDTO[]>(this.apiURL + '/consulta-nativa');
  }
  getByOwner(idUser: number): Observable<HealthprofileDTO | null> {
    return this.listOwned().pipe(
      map(
        (rows) =>
          rows.find((p) => p.active && p.idOwnerUser === idUser && p.idHolderUser === idUser) ??
          null,
      ),
    );
  }
  insertHealthProfile(
    dto: Omit<HealthprofileDTO, 'idHealthProfile'> & { idHealthProfile?: number },
  ): Observable<HealthprofileDTO> {
    const { idHealthProfile, ...body } = dto;
    return this.http.post<HealthprofileDTO>(this.apiURL, body);
  }

  // PUT /api/healthprofiles  (el backend recibe el DTO completo con su id)
  updateHealthProfile(dto: HealthprofileDTO): Observable<HealthprofileDTO> {
    return this.http.put<HealthprofileDTO>(this.apiURL, dto);
  }
}
