import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { LoginResponseDTO } from '../model/LoginresponseDTO';
import { LoginRequestDTO } from '../model/LoginrequestDTO';
 
@Injectable({
  providedIn: 'root',
})
export class Loginservice {
  // Tu LoginController: @RequestMapping("/login") + @PostMapping
  private apiURL = `${environment.base}/login`;
 
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}
 
  login(correo: string, clave: string): Observable<LoginResponseDTO> {
    const body: LoginRequestDTO = { email: correo, password: clave };
 
    return this.http.post<LoginResponseDTO>(this.apiURL, body).pipe(
      tap((resp) => {
        // localStorage solo existe en el navegador (no en el servidor con SSR)
        if (isPlatformBrowser(this.platformId) && resp?.token) {
          localStorage.setItem('token', resp.token);
          localStorage.setItem('email', resp.email);
        }
      }),
    );
  }
 
  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
  }
 
  getEmail(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('email') : null;
  }
 
  estaLogueado(): boolean {
    return !!this.getToken();
  }
 
  cerrarSesion(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
    }
  }
}
 