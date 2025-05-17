import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';

import { ConfigService } from '../config/config.service';
import { RatingRes, RatingReq } from '../../models/user-course.models';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  protected readonly apiUrl: string = this.config.getApiUrl();

  create(courseId: number, rating: RatingReq): Observable<RatingRes> {
    return this.http.post<RatingRes>(`${this.apiUrl}/api/v1/ratings/${courseId}`, rating);
  }

}
