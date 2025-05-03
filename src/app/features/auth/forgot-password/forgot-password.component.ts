import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

import { AuthService } from '../../../core/services/auth/auth.service';
import { LayoutService } from '../../../core/services/config/layout.service';
import { ConfigService } from '../../../core/services/config/config.service';

@Component({
  selector    : 'app-forgot-password',
  templateUrl : './forgot-password.component.html',
  styleUrl    : './forgot-password.component.css',
  imports     : [
    RouterLink,
    CommonModule,
    ReactiveFormsModule
  ]
})
export class ForgotPasswordComponent implements OnDestroy {
  private readonly layoutService : LayoutService = inject(LayoutService);
  private readonly authService   : AuthService   = inject(AuthService);
  private readonly configService : ConfigService = inject(ConfigService);
  private readonly location      : Location      = inject(Location);

  protected readonly hostUrl: string = this.configService.getApiUrl();

  readonly forgotPasswordForm = new FormGroup({
    email: new FormControl('', {
      validators  : [Validators.required, Validators.email],
      nonNullable : true,
    }),
  });

  successMessage : string | null = null;
  errorMessage   : string | null = null;
  loading        : boolean       = false;

  constructor() {
    this.layoutService.hideLayout();
  }

  submit() {
    const { email } = this.forgotPasswordForm.value;

    this.loading = true;
    this.authService.recoverPassword(email as string).subscribe({
      next: () => {
        this.location.back();
      },
      error: () => {
        this.errorMessage = `Before you can reset your password, your email must be verified.
          We’ve just sent you a new verification email — please check your inbox.`;
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.layoutService.showLayout();
  }

}
