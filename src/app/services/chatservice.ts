import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ChatRequestDTO, ChatResponseDTO } from '../model/ChatDTO';

@Injectable({
  providedIn: 'root',
})
export class Chatservice {
  private readonly apiURL = `${environment.base}/api/chat`;

  constructor(private readonly http: HttpClient) {}

  sendMessage(request: ChatRequestDTO): Observable<ChatResponseDTO> {
    return this.http.post<ChatResponseDTO>(this.apiURL, request);
  }
}
