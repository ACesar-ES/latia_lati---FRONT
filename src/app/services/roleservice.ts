import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleDTO } from '../model/RoleDTO';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class Roleservice {
  private apiURL = `${environment.base}/api/roles`;

  constructor(private http: HttpClient) {}

  listar(): Observable<RoleDTO[]> {
    return this.http.get<RoleDTO[]>(this.apiURL);
  }

  // Siempre se guarda como ROLE_NOMBRE (por ejemplo ROLE_ADMIN)
  conPrefijo(nombre: string): string {
    const limpio = nombre.trim().toUpperCase();
    return limpio.startsWith('ROLE_') ? limpio : 'ROLE_' + limpio;
  }

  // Sin "id": el backend debe crear una fila nueva, no actualizar una existente
  asignar(nombre: string, idUser: number): Observable<RoleDTO> {
    return this.http.post<RoleDTO>(this.apiURL, { rol: this.conPrefijo(nombre), idUser });
  }

  quitar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}