import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router: Router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Unexpected error';

      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Connection error - Check your internet connection';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found';
        router.navigate(['/not-found']);
      } else if (error.status >= 500) {
        errorMessage = 'Internal service error - Try again later';
      }

      // Reenviar el error para que los componentes puedan manejarlo si es necesario
      return throwError(() => error);
    })
  );
};
