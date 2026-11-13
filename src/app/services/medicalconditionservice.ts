import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalconditionDTO } from '../model/MedicalconditionDTO';

@Injectable({
  providedIn: 'root',
})
export class Medicalconditionservice {
  private apiURL = `${environment.base}/api/medicalconditions`;

  constructor(private http: HttpClient) {}

  getMedicalCondition(): Observable<MedicalconditionDTO[]> {
    return this.http.get<MedicalconditionDTO[]>(this.apiURL);
  }
  deleteMedicalCondition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  insertMedicalCondition(cr: MedicalconditionDTO): Observable<MedicalconditionDTO> {
    return this.http.post<MedicalconditionDTO>(this.apiURL, cr)

  }
  listId(id: number): Observable<MedicalconditionDTO> {
    return this.http.get<MedicalconditionDTO>(`${this.apiURL}/${id}`);
  }
  updateMedicalCondition(dto: MedicalconditionDTO): Observable<MedicalconditionDTO> {
    return this.http.put<MedicalconditionDTO>(this.apiURL, dto);
  }
}
