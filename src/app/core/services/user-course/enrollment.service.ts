import { Observable, catchError, of, switchMap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { ConfigService } from '../config/config.service';
import { inject, Injectable } from '@angular/core';
import { Enrollment } from '../../models/user-course.models';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  protected readonly apiUrl: string = this.config.getApiUrl();

  /**
   * Creates a new enrollment for a course
   *
   * @param {number} courseId - The ID of the course to enroll in
   * @param {Object} [flags] - Optional flags for the enrollment
   * @param {boolean} [flags.isFavorite] - Whether the course should be marked as favorite
   *
   * @returns {Observable<Enrollment>} An observable of the created enrollment
   */
  create(courseId: number, flags?: { isFavorite?: boolean }): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.apiUrl}/api/v1/users/@me/enrollments/${courseId}`, flags || null);
  }

  /**
   * Gets all enrollments for the current user
   *
   * @returns {Observable<Enrollment[]>} An observable of the user's enrollments
   */
  findAll(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.apiUrl}/api/v1/users/@me/enrollments`);
  }

  /**
   * Gets a specific enrollment by course ID
   *
   * @param {number} courseId - The ID of the course
   *
   * @returns {Observable<Enrollment>} An observable of the enrollment
   */
  findById(courseId: number): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.apiUrl}/api/v1/users/@me/enrollments/${courseId}`);
  }

  /**
   * Finds or creates an enrollment if it doesn't exist
   *
   * @param {number} courseId - The ID of the course
   *
   * @returns {Observable<Enrollment>} An observable of the found or created enrollment
   */
  findOrCreate(courseId: number): Observable<Enrollment> {
    return this.findById(courseId);
  }

  /**
   * Updates basic enrollment properties. If enrollment doesn't exist (404),
   * creates a new one and applies the updates.
   *
   * @param {number} courseId - The ID of the course
   * @param {Object} updates - The properties to update
   *
   * @returns {Observable<Enrollment>} An observable of the updated enrollment
   */
  update(courseId: number, updates: {
    isFavorite?: boolean,
    isArchived?: boolean
    isCompleted?: boolean,
  }): Observable<Enrollment> {
    return this.http.put<Enrollment>(
      `${this.apiUrl}/api/v1/users/@me/enrollments/${courseId}`,
      updates
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return this.create(courseId, updates).pipe(
            switchMap(enrollment => {
              return of(enrollment);
            })
          );
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Updates the course progress state
   *
   * @param {number} courseId - The ID of the course
   * @param {number} sectionId - The ID of the current section
   * @param {number} lessonId - The ID of the current lesson
   * @param {boolean} markAsCompleted - Whether to mark the lesson as completed
   *
   * @returns {Observable<Enrollment>} An observable of the updated enrollment
   */
  updateProgress(
    courseId: number,
    sectionId: number,
    lessonId: number,
    markAsCompleted: boolean
  ): Observable<Enrollment> {
    const updates = {
      sectionId,
      lessonId,
      isCompleted: markAsCompleted
    };

    return this.http.patch<Enrollment>(`${this.apiUrl}/api/v1/users/@me/enrollments/${courseId}/progress`, updates);
  }

  /**
   * Deletes an enrollment
   *
   * @param {number} courseId - The ID of the course
   *
   * @returns {Observable<void>} An observable that completes when deletion is done
   */
  delete(courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/v1/users/@me/enrollments/${courseId}`);
  }

  /**
   * Handles HTTP errors
   *
   * @param {HttpErrorResponse} error - The HTTP error response
   *
   * @returns {Observable<never>} An observable that throws the error message
   *
   * @private
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.message || error.message || 'Unknown error';
    return throwError(() => new Error(errorMessage + error.url));
  }

}
