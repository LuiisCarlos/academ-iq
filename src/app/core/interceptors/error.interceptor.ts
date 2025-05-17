import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router : Router = inject(Router);
  const toast  : ToastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage: string = '';

      switch (error.status) {
        case 401:
          errorMessage = error.error.message ?? 'Unauthorized - Please log in again';
          router.navigate(['/auth/login']);
          break;
        case 403:
          errorMessage = error.error.message ?? 'Forbidden - You do not have permission to access this resource';
          break;
        case 404:
          errorMessage = error.error.message ?? 'Not Found - The requested resource could not be found';
          break;
        case 500:
          errorMessage = error.error.message ?? 'Internal Server Error - Please try again later';
          break;
        default:
          errorMessage = error.error.message ?? 'An unexpected error occurred';
      }

      toast.show(errorMessage, 'error');

      return throwError(() => error);
    })
  );
};
