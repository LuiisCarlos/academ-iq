import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config/config.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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

  protected readonly apiUrl: string = this.configService.getApiUrl();

  updateUser(user: UserDetails) {
    return this.http.put<UserDetails>(`${this.apiUrl}/api/v1/users/@me`, user).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  patchAvatar(avatarFile: File) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    return this.http.patch(`${this.apiUrl}/api/v1/users/@me/avatar`, formData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          const errorMessage = error.error?.message || 'Unknown error';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  changePassword(passwordDto: changePasswordDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/v1/users/@me/change-password`, passwordDto)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          const errorMessage = error.error?.message || 'Unknown error';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

}
