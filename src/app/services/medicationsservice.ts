import { Injectable, Service } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicationsDTO } from '../model/MedicationsDTO';


@Injectable({
  providedIn: 'root',
})
export class Medicationsservice {
  private apiURL=`${environment.base}/apis/medications`;

  constructor(private http: HttpClient) {}

  getMedication(): Observable<MedicationsDTO[]> {
    return this.http.get<MedicationsDTO[]>(this.apiURL);
  }
  deleteMedication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  insertMedication(m: MedicationsDTO): Observable<MedicationsDTO> {
    return this.http.post<MedicationsDTO>(this.apiURL, m);
  }
  listId(id: number): Observable<MedicationsDTO> {
    return this.http.get<MedicationsDTO>(`${this.apiURL}/${id}`);
  }
  updateMedication(dto: MedicationsDTO): Observable<MedicationsDTO> {
    return this.http.put<MedicationsDTO>(this.apiURL, dto);
  }
}
