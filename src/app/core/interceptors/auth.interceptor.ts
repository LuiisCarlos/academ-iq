import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

import { TokenService } from '../services/auth/token.service';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService : TokenService = inject(TokenService);
  const authService  : AuthService  = inject(AuthService);
  const router       : Router       = inject(Router);

  const ignoreUrls = [
    'auth/login',
    'auth/logout',
    'auth/register',
    'auth/refresh',
    'auth/recover-password',
    'auth/reset-password',
    'auth/verify'
  ];

  const shouldIgnore = ignoreUrls.some(url => req.url.includes(url));
  if (shouldIgnore) return next(req);

  const accessToken: string = tokenService.getAccessToken();
  if (!accessToken) return next(req);

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      return authService.refresh().pipe(
        switchMap((newToken: string) => {
          tokenService.saveAccessToken(newToken);

          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });

          return next(retryReq);
        }),
        catchError((refreshError) => {
          authService.logout().subscribe(() => {
            router.navigate(['/login'], {
              queryParams: { sessionExpired: true }
            });
          });
          return throwError(() => refreshError);
        })
      );
    })
  );
};