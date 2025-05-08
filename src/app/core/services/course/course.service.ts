import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { ConfigService } from '../config/config.service';
import { Category, Course } from '../../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly configService : ConfigService = inject(ConfigService);
  private readonly http          : HttpClient    = inject(HttpClient);
  private readonly hostUrl       : string        = this.configService.getApiUrl();

  findAll(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.hostUrl}/api/v1/courses`).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || 'Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  findAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.hostUrl}/api/v1/courses/categories`).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || 'Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  findCategoryByName(category: string): Observable<Category> {
    return this.http.get<Category>(`${this.hostUrl}/api/v1/courses/categories/${category}`).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || 'Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  findById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.hostUrl}/api/v1/courses/${id}`).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || 'Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

}
