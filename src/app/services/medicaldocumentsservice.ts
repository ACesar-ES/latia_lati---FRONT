import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicaldocumentsDTO } from '../model/MedicaldocumentsDTO';

@Injectable({
  providedIn: 'root',
})
export class Medicaldocumentsservice {
  private apiURL = `${environment.base}/api/medical-documents`;

  constructor(private http: HttpClient) {}

  getMedicalDocument(): Observable<MedicaldocumentsDTO[]>{
    return this.http.get<MedicaldocumentsDTO[]>(this.apiURL);
  }
    deleteMedicalDocument(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiURL}/${id}`);
    }

    insertMedicalDocument(cr: MedicaldocumentsDTO): Observable<MedicaldocumentsDTO> {
      return this.http.post<MedicaldocumentsDTO>(this.apiURL, cr);
    }
    listId(id: number): Observable<MedicaldocumentsDTO> {
      return this.http.get<MedicaldocumentsDTO>(`${this.apiURL}/${id}`);
    }
    updateMedicalDocument(dto: MedicaldocumentsDTO): Observable<MedicaldocumentsDTO> {
      return this.http.put<MedicaldocumentsDTO>(this.apiURL, dto);
    }
}
