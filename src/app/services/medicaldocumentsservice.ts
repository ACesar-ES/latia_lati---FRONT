import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DocumentPeriod } from '../model/DocumentPeriod';
import { MonthlyDocumentCountDTO } from '../model/MonthlyDocumentCountDTO';
import { Observable } from 'rxjs';
import { MedicaldocumentsDTO } from '../model/MedicaldocumentsDTO';

@Injectable({
  providedIn: 'root',
})
export class Medicaldocumentsservice {
  private apiURL = `${environment.base}/api/medicaldocuments`;

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

  private evolutionParams(profileId: number, period: DocumentPeriod): HttpParams {
    let params = new HttpParams()
      .set('profileId', profileId)
      .set('startDate', period.startDate)
      .set('endDate', period.endDate);
    if (period.documentType.trim()) params = params.set('documentType', period.documentType.trim());
    return params;
  }

  getTimeline(profileId: number, period: DocumentPeriod): Observable<MedicaldocumentsDTO[]> {
    return this.http.get<MedicaldocumentsDTO[]>(this.apiURL + '/timeline', {
      params: this.evolutionParams(profileId, period),
    });
  }

  getMonthlyReport(profileId: number, period: DocumentPeriod): Observable<MonthlyDocumentCountDTO[]> {
    return this.http.get<MonthlyDocumentCountDTO[]>(this.apiURL + '/report/monthly', {
      params: this.evolutionParams(profileId, period),
    });
  }
}
