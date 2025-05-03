import { Injectable } from '@angular/core';
import { environment } from '../../../env/environment';

type AppEnv = typeof environment;

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  /**
   * Returns environment config of application
   */
  getEnvironment(): AppEnv {
    return environment;
  }

  /**
   * Indicates whether the apps is running in production mode
   *
   * @returns {boolean}  if the project is in production mode
   */
  isProd(): boolean {
    return environment.production;
  }

  /**
   * Returns app's version
   */
  getVersion(): string {
    return environment.appVersion;
  }

  /**
   * the server's host url
   *
   * @returns {string} the API url
   */
  getApiUrl(): string {
    return environment?.apiUrl ?? '';
  }

  /**
   * Returns configuration for auth client and secret
   */
  getAuthSettings(): AppEnv['settings']['auth'] {
    return environment?.settings?.auth;
  }

}