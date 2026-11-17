import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { FamilyrelationshipDTO } from '../model/FamilyrelationshipDTO';

@Injectable({
  providedIn: 'root',
})
export class Familyrelationshipservice {
  private apiURL = `${environment.base}/api/familyrelationships`;

  constructor(private http: HttpClient) {}

  // HU46: POST /api/familyrelationships
  insert(fr: FamilyrelationshipDTO): Observable<FamilyrelationshipDTO> {
    return this.http.post<FamilyrelationshipDTO>(this.apiURL, fr);
  }

  // HU73: GET /api/familyrelationships/perfil/{healthProfileId}
  listByProfile(idHealthProfile: number): Observable<FamilyrelationshipDTO[]> {
    return this.http.get<FamilyrelationshipDTO[]>(`${this.apiURL}/perfil/${idHealthProfile}`);
  }
}
