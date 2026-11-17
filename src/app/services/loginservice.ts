import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, auditTime, filter, fromEvent, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { LoginResponseDTO } from '../model/LoginresponseDTO';
import { LoginRequestDTO } from '../model/LoginrequestDTO';

@Injectable({
  providedIn: 'root',
})
export class Loginservice {
  private readonly changed = new Subject<void>();
  readonly sessionChanged$ = this.changed.asObservable();
  // Tu LoginController: @RequestMapping("/login") + @PostMapping
  private apiURL = `${environment.base}/login`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      fromEvent<StorageEvent>(window, 'storage')
        .pipe(
          filter((e) => e.key === null || e.key === 'token' || e.key === 'email'),
          auditTime(0),
          takeUntilDestroyed(),
        )
        .subscribe(() => this.changed.next());
    }
  }

  login(correo: string, clave: string): Observable<LoginResponseDTO> {
    const body: LoginRequestDTO = { email: correo, password: clave };

    return this.http.post<LoginResponseDTO>(this.apiURL, body).pipe(
      tap((resp) => {
        // localStorage solo existe en el navegador (no en el servidor con SSR)
        if (isPlatformBrowser(this.platformId) && resp?.token) {
          localStorage.setItem('token', resp.token);
          localStorage.setItem('email', resp.email);
          this.changed.next();
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
      this.changed.next();
    }
  }
}
