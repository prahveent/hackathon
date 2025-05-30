import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Add auth header if user is authenticated
  let authReq = req;
  if (authService.isAuthenticated() && authService.token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authService.token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid
        authService.logout().subscribe();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        // Insufficient permissions
        router.navigate(['/access-denied']);
      }
      return throwError(() => error);
    })
  );
};
