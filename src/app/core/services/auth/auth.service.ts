import { Injectable, Signal, WritableSignal, effect, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';

import { LoginResponseDto, UserRegisterDto, UserDetails } from '../../models/auth.models';
import { ConfigService } from '../config/config.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly tokenService: TokenService = inject(TokenService);
  private readonly http: HttpClient = inject(HttpClient);

  protected readonly hostUrl: string = this.configService.getApiUrl();

  private currentUser: WritableSignal<UserDetails | null> = signal(null);
  public user: Signal<UserDetails | null> = this.currentUser.asReadonly();

  constructor() {
    effect(() => {
      const token = this.tokenService.getAccessToken();
      if (token)
        this.loadUser().subscribe();
      else
        this.currentUser.set(null);
    });
  }

  /**
   * Performs a request with user details
   * in order to register the user in the website
   *
   * @param {UserRegisterDto} userDto the data of the user
   *
   * @returns Observable<UserRegisterDto>
   */
  register(userDto: UserRegisterDto): Observable<UserRegisterDto> {
    return this.http.post<UserRegisterDto>(`${this.hostUrl}/api/v1/auth/register`, userDto);
  }

  /**
   * Performs a request with user credentials in order to get authentication tokens
   *
   * @param {string} username the username of the user
   * @param {string} password the password of the user
   *
   * @returns Observable<LoginResponseDto> the authentication tokens
   */
  login(username: string, password: string): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.hostUrl}/api/v1/auth/login`, { username, password })
      .pipe(
        tap(response => {
          this.tokenService.saveAccessToken(response.accessToken);
          this.tokenService.saveRefreshToken(response.refreshToken);
        })
      );
  }

  /**
   * Performs a request for logout authenticated user
   *
   * @returns Observable<void>
   */
  logout(): Observable<void> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken)
      return throwError(() => new Error('Refresh token does not exist'));

    const headers = new HttpHeaders({ Authorization: `Bearer ${refreshToken}` });
    return this.http.post<void>(`${this.hostUrl}/api/v1/auth/logout`, null, { headers }).pipe(
      tap(() => {
        this.tokenService.removeTokens();
      })
    );
  }

  /**
   * Performs a request to recover the password of the user
   *
   * @param {string} email the email of the user
   *
   * @returns Observable<void>
   */
  recoverPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.hostUrl}/api/v1/auth/recover-password`, email);
  }

  /**
   * Performs a request to reset the password of the user
   *
   * @param {string} token           the recover password token
   * @param {string} password        the given new password
   * @param {string} confirmPassword the confirmation of the new password
   *
   * @returns Observable<void>
   */
  resetPassword(token: string, password: string, confirmPassword: string): Observable<void> {
    const params = new HttpParams()
      .set('token', token);
    return this.http.post<void>(
      `${this.hostUrl}/api/v1/auth/reset-password`,
      { password, confirmPassword },
      { params }
    );
  }

  /**
   * Asks for a new access token given the stored refresh token
   *
   * @returns {Observable<string>}
   */
  refresh(): Observable<string> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken)
      return throwError(() => new Error('No refresh token available'));

    const params = new HttpParams().set('token', refreshToken);
    return this.http.get<string>(`${this.hostUrl}/api/v1/auth/refresh`, { params }).pipe(
      map(response => {
        return response;
      })
    );
  }


  /**
   *  Performs a request to verify the user in the website
   *
   * @param {string} verifyToken the verify account token
   *
   * @returns Observable<void>
   */
  verify(verifyToken: string): Observable<void> {
    const params = new HttpParams().set('token', verifyToken);
    return this.http.get<void>(`${this.hostUrl}/api/v1/auth/verify`, { params });
  }

  isLoggedIn(): boolean {
    const token = this.tokenService.getAccessToken();
    return !!token;
    /*const decoded: any = jwt_decode(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;*/
  }

  /**
   * Loads the current authenticated user form its accessToken
   *
   * @returns {UserDetails} the user
   */
  loadUser(): Observable<UserDetails> {
    return this.http.get<UserDetails>(`${this.hostUrl}/api/v1/users/@me`).pipe(
      tap((response) => {
        this.currentUser.set(response);
      }),
      catchError((error) => {
        this.currentUser.set(null);
        const errorMessage = error.error?.message || 'Unknown error';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

}