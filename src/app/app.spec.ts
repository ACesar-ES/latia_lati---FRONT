import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { NEVER } from 'rxjs';
import { App } from './app';
import { routes } from './app.routes';
import { Loginservice } from './services/loginservice';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: Loginservice,
          useValue: { getToken: () => null, getEmail: () => null, sessionChanged$: NEVER },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('opens the profile selector through the app outlet and asks a signed-out visitor to sign in', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/cambiar-perfil');
    await fixture.whenStable();
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('h1')?.textContent).toContain('¿A quién vamos a cuidar hoy?');
    expect(page.querySelector('main a[href="/login"]')?.textContent).toContain('Iniciar sesión');
    expect(page.querySelector('.cards')).toBeNull();
  });
});
