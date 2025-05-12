import { Observable, Subject, catchError, switchMap, throwError } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { inject, Injectable } from '@angular/core';
import { Enrollment, ProgressState } from '../../models/user.models';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly http   : HttpClient    = inject(HttpClient);
  private readonly config : ConfigService = inject(ConfigService);

  protected readonly apiUrl: string = this.config.getApiUrl();

  saveByCourseId(courseId: number, isFavorite?: boolean ): Observable<Enrollment> {
    const body = isFavorite !== undefined ? { isFavorite } : null;

    return this.http.post<Enrollment>(`${this.apiUrl}/api/v1/users/@me/enrollments/${courseId}`, body).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  findAll(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/api/v1/users/@me/enrollments`).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.message || 'Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  findById(courseId: number): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/api/v1/users/@me/enrollments/${courseId}`).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.message || 'Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  patchCompleted(courseId: number): Observable<Enrollment> {
    return this.http.patch<Enrollment>(`${this.apiUrl}/api/v1/users/@me/enrollments/${courseId}`, { isCompleted: true })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          const errorMessage = error.message || 'Unknown error';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  patchFavorite(courseId: number, isFavorite: boolean): Observable<Enrollment> {
    return this.http.patch<Enrollment>(`${this.apiUrl}/api/v1/users/@me/enrollments/${courseId}`, { isFavorite })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 403 || error.status === 404)
            return this.saveByCourseId(courseId, isFavorite).pipe(
              switchMap(() => this.patchFavorite(courseId, isFavorite))
            )

          const errorMessage = error.message || 'Unknown error';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  patchArchived(courseId: number, isArchived: boolean): Observable<Enrollment> {
    return this.http.patch<Enrollment>(`${this.apiUrl}/api/v1/users/@me/enrollments/${courseId}`, { isArchived })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          const errorMessage = error.message || 'Unknown error';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  patchProgressState(courseId: number, progressState: ProgressState): Observable<Enrollment> {
    console.log(progressState);
    return this.http.put<Enrollment>(`${this.apiUrl}/api/v1/users/@me/enrollments/${courseId}/progress`, progressState)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.log(error);
          const errorMessage = error.message || 'Unknown error';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

}
