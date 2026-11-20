import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClinicalrecordDTO } from '../model/ClinicalrecordDTO';
import { CountclinicalrecordsbymedicalconditionDTO } from '../model/CountclinicalrecordsbymedicalconditionDTO';

@Injectable({
  providedIn: 'root',
})
export class Clinicalrecordservice {
  private apiURL = `${environment.base}/apis/clinicalrecords`;

  constructor(private http: HttpClient) {}

  getClinicalRecord(): Observable<ClinicalrecordDTO[]> {
    return this.http.get<ClinicalrecordDTO[]>(this.apiURL);
  }
  deleteClinicalRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  insertClinicalRecord(cr: ClinicalrecordDTO): Observable<ClinicalrecordDTO> {
    return this.http.post<ClinicalrecordDTO>(this.apiURL, cr);
  }
  listId(id: number): Observable<ClinicalrecordDTO> {
    return this.http.get<ClinicalrecordDTO>(`${this.apiURL}/${id}`);
  }
  updateClinicalRecord(dto: ClinicalrecordDTO): Observable<ClinicalrecordDTO> {
    return this.http.put<ClinicalrecordDTO>(this.apiURL, dto);
  }

  getcountbycondition(): Observable<CountclinicalrecordsbymedicalconditionDTO[]> {
    return this.http.get<CountclinicalrecordsbymedicalconditionDTO[]>(`${this.apiURL}/reporte/condiciones`)
  }
}
