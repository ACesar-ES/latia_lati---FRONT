import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { FamilyrelationshipDTO } from '../model/FamilyrelationshipDTO';
import type { Kinship } from '../utils/family-tree';

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
