import { Observable, catchError, throwError } from 'rxjs';
import { ConfigService } from './config/config.service';
import { inject, Injectable } from '@angular/core';
import { Enrollment } from '../models/user.models';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly http   : HttpClient    = inject(HttpClient);
  private readonly config : ConfigService = inject(ConfigService);

  protected readonly apiUrl: string = this.config.getApiUrl();

  findAll(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/api/v1/users/@me/enrollments`).pipe(
      catchError((error) => {
        const errorMessage = error.error?.message || 'Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  findById(courseId: number): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/api/v1/users/@me/enrollments/${courseId}`).pipe(
      catchError((error) => {
        const errorMessage = error.error?.message || 'Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateFavorite(courseId: number, isFavorite: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/api/v1/users/@me/enrollments/${courseId}`, { isFavorite })
      .pipe(
        catchError((error) => {
          const errorMessage = error.error?.message || 'Unknown error';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  updateArchived(courseId: number, isArchived: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/api/v1/users/@me/enrollments/${courseId}`, { isArchived })
      .pipe(
        catchError((error) => {
          const errorMessage = error.error?.message || 'Unknown error';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

}
