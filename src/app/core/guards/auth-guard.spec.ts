import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Loginservice } from '../../services/loginservice';
import { guestGuard } from './auth-guard';

describe('guestGuard', () => {
  let authenticated: boolean;

  beforeEach(() => {
    authenticated = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Loginservice, useValue: { isAuthenticated: () => authenticated } },
      ],
    });
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  it('allows guests to open login and registration pages', () => {
    expect(runGuard()).toBe(true);
  });

  it('redirects authenticated users to the dashboard', () => {
    authenticated = true;

    const result = runGuard();

    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/inicio');
  });
});
