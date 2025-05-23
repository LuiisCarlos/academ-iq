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
    return this.http.get<Course[]>(`${this.hostUrl}/api/v1/courses`);
  }

  findAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.hostUrl}/api/v1/courses/categories`);
  }

  findCategoryByName(category: string): Observable<Category> {
    return this.http.get<Category>(`${this.hostUrl}/api/v1/courses/categories/${category}`);
  }

  findById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.hostUrl}/api/v1/courses/${id}`);
  }

}
