import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment.development';
import { Loginservice } from './loginservice';

describe('Loginservice', () => {
  let service: Loginservice;
  let httpTesting: HttpTestingController;
  const token = `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature`;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(Loginservice);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('stores the returned token and email in shared local storage', () => {
    service.login({ email: 'user@example.com', password: 'password' }).subscribe();
    httpTesting.expectOne(`${environment.base}/login`).flush({
      token,
      email: 'user@example.com',
    });

    expect(localStorage.getItem('token')).toBe(token);
    expect(localStorage.getItem('email')).toBe('user@example.com');
    expect(service.getToken()).toBe(token);
  });

  it('removes the shared credentials on logout', () => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', 'user@example.com');

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('email')).toBeNull();
  });

  it('reads roles from the signed-in token claims', () => {
    const tokenWithRoles = `header.${btoa(
      JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + 3600,
        roles: 'ROLE_USER,ROLE_ADMIN',
      }),
    )}.signature`;
    localStorage.setItem('token', tokenWithRoles);

    expect(service.getRoles()).toEqual(['ROLE_USER', 'ROLE_ADMIN']);
  });
});
