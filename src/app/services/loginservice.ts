import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { LoginResponseDTO } from '../model/LoginresponseDTO';
import { LoginRequestDTO } from '../model/LoginrequestDTO';



@Injectable({
  providedIn: 'root',
})
export class Loginservice {
  private readonly apiURL = `${environment.base}/login`;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private readonly http: HttpClient) { }

  login(credentials: LoginRequestDTO): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>(this.apiURL, credentials).pipe(
      tap((response) => {
        if (!response?.token) {
          throw new Error('La respuesta de login no contiene un token.');
        }

        if (this.isBrowser) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('email', response.email ?? '');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('email');
          sessionStorage.removeItem('roles');
          localStorage.setItem('roles', JSON.stringify(response.roles ?? []));
        }
      })
    );
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    if (this.isExpired(token)) {
      this.logout();
      return null;
    }

    return token;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getEmail(): string {
    if (!this.isBrowser || !this.isAuthenticated()) {
      return '';
    }

    return localStorage.getItem('email') ?? '';
  }

  getRoles(): string[] {
    const token = this.getToken();
    if (!this.isBrowser || !token) {
      return [];
    }

    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return [];

      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const payload: unknown = JSON.parse(
        atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')),
      );
      if (payload === null || typeof payload !== 'object' || !('roles' in payload)) return [];

      const roles = payload.roles;
      if (typeof roles === 'string') {
        return roles.split(',').map((role) => role.trim()).filter(Boolean);
      }
      if (Array.isArray(roles) && roles.every((role) => typeof role === 'string')) return roles;
    } catch {
      return [];
    }

    return [];
  }

  hasAnyRole(allowedRoles: readonly string[]): boolean {
    const normalize = (role: string) =>
      role.startsWith('ROLE_') ? role.slice('ROLE_'.length) : role;

    const allowed = new Set(allowedRoles.map(normalize));
    return this.getRoles().some((role) => allowed.has(normalize(role)));
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('roles');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('email');
      sessionStorage.removeItem('roles');
    }
  }

  private isExpired(token: string): boolean {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return true;
      }

      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const payload: unknown = JSON.parse(
        atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
      );

      if (payload === null || typeof payload !== 'object' || !('exp' in payload)) {
        return true;
      }

      const exp = payload.exp;
      return typeof exp !== 'number' || !Number.isFinite(exp) || exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}