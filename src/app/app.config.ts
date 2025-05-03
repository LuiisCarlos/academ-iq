import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { DatePipe } from '@angular/common';

import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { DateFormatPipe } from './shared/pipes/date-format.pipe';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top', // 'top' | 'enabled' | 'disabled'
        anchorScrolling: 'enabled'
      })
    ),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    ),
    DatePipe,
    DateFormatPipe
  ]
};
