import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config/config.service';
import { HttpClient } from '@angular/common/http';
import { changePasswordDto } from '../models/user.models';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { UserDetails } from '../models/auth.models';
import { Enrollment } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly configService : ConfigService = inject(ConfigService);
  private readonly http          : HttpClient    = inject(HttpClient);

  protected readonly hostUrl: string = this.configService.getApiUrl();

  updateUser(user: UserDetails) {
    return this.http.put<UserDetails>(`${this.hostUrl}/api/v1/users/@me`, user).pipe(
      catchError(error => {
        const errorMessage = error.error?.message || 'Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  changePassword(passwordDto: changePasswordDto): Observable<void> {
    return this.http.post<void>(`${this.hostUrl}/api/v1/users/@me/change-password`, passwordDto)
      .pipe(
        catchError(error => {
          const errorMessage = error.error?.message || 'Unknown error';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

}
