import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ConfigService } from './config/config.service';
import { changePasswordDto } from '../models/user.models';
import { UserDetails } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly configService : ConfigService = inject(ConfigService);
  private readonly http          : HttpClient    = inject(HttpClient);

  protected readonly apiUrl: string = this.configService.getApiUrl();

  updateUser(user: UserDetails) {
    return this.http.put<UserDetails>(`${this.apiUrl}/api/v1/users/@me`, user);
  }

  patchAvatar(avatarFile: File) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    return this.http.patch(`${this.apiUrl}/api/v1/users/@me/avatar`, formData);
  }

  changePassword(passwordDto: changePasswordDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/v1/users/@me/change-password`, passwordDto);;
  }

}
