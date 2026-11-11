import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, throwError } from 'rxjs';
import { UsersResponseDTO } from '../model/UsersResponseDTO';
import { UsersRequestDTO } from '../model/UsersRequestDTO';
import { Loginservice } from './loginservice';
 
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiURL = `${environment.base}/api/users`;
 
  // Usuario que inició sesión (lo comparten el menú y las pantallas de perfil)
  private usuario = new BehaviorSubject<UsersResponseDTO | null>(null);
  usuario$ = this.usuario.asObservable();
 
  constructor(
    private http: HttpClient,
    private login: Loginservice,
  ) {}
 
  // ---------------- TU CRUD (sin cambios) ----------------
 
  // Listar todos los usuarios (GET /api/users)
  getUsers(): Observable<UsersResponseDTO[]> {
    return this.http.get<UsersResponseDTO[]>(this.apiURL);
  }
 
  // Registrar un nuevo usuario (POST /api/users/registro)
  insertUser(user: UsersRequestDTO): Observable<UsersResponseDTO> {
    return this.http.post<UsersResponseDTO>(`${this.apiURL}/registro`, user);
  }
 
  // Buscar un usuario por ID (GET /api/users/{id})
  listId(id: number): Observable<UsersResponseDTO> {
    return this.http.get<UsersResponseDTO>(`${this.apiURL}/${id}`);
  }
 
  // Actualizar un usuario (PUT /api/users)
  updateUser(user: UsersRequestDTO): Observable<UsersResponseDTO> {
    return this.http.put<UsersResponseDTO>(this.apiURL, user);
  }
 
  // Eliminar un usuario (DELETE /api/users/{id})
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
 
  // Buscar por correo (GET /api/users/buscar-por-email?email=...)
  getUserByEmail(email: string): Observable<UsersResponseDTO> {
    const params = new HttpParams().set('email', email);
    return this.http.get<UsersResponseDTO>(`${this.apiURL}/buscar-por-email`, { params });
  }
 
  // ---------------- USUARIO DE LA SESIÓN (nuevo) ----------------
 
  /** Devuelve el usuario de la sesión actual (el del correo que guardó el login). */
  cargarUsuarioActual(): Observable<UsersResponseDTO> {
    const email = this.login.getEmail();
    if (!email) {
      return throwError(() => new Error('No hay sesión iniciada'));
    }
 
    const actual = this.usuario.value;
    if (actual && actual.email === email) {
      return of(actual); // ya lo teníamos, no pedimos de nuevo
    }
 
    return this.getUserByEmail(email).pipe(tap((u) => this.usuario.next(u)));
  }
 
  /** Fuerza volver a pedirlo al backend (por ejemplo después de editar datos). */
  refrescar(): void {
    this.usuario.next(null);
  }
 
  /** Llámalo al cerrar sesión. */
  limpiar(): void {
    this.usuario.next(null);
  }
}