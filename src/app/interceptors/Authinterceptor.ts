import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Loginservice } from '../services/loginservice';
 
// Agrega "Authorization: Bearer <token>" a cada petición, excepto al login
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(Loginservice).getToken();
 
  if (!token || req.url.endsWith('/login')) {
    return next(req);
  }
 
  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};