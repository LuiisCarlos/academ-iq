import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth/auth.service';
import { ConfigService } from '../../../core/services/config/config.service';

@Component({
  selector    : 'app-forgot-password',
  templateUrl : './forgot-password-dialog.component.html',
  styleUrl    : './forgot-password-dialog.component.css',
  imports     : [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule
  ]
})

export class ForgotPasswordDialogComponent {
  private readonly dialogRef     : MatDialogRef<ForgotPasswordDialogComponent> = inject(MatDialogRef);
  private readonly authService   : AuthService   = inject(AuthService);
  private readonly configService : ConfigService = inject(ConfigService);

  protected readonly hostUrl: string = this.configService.getApiUrl();

  readonly forgotPasswordForm = new FormGroup({
    email: new FormControl('', {
      validators  : [Validators.required, Validators.email],
      nonNullable : true,
    }),
  });

  successMessage : string = '';
  errorMessage   : string = '';
  loading        : boolean = false;


  submit() {
    const { email } = this.forgotPasswordForm.value;

    this.loading = true;
    this.authService.recoverPassword(email as string).subscribe({
      next: () => {
        //this.dialogRef.close()
        this.successMessage = 'An email has been sent. Check your mailbox to reset your password.'
      },
      error: () => {
        this.errorMessage = 'Oops! An unexpected error occurred. Please try again later.';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  openRegisterDialog() {
    this.dialogRef.close('open-register-dialog');
  }

  openLoginDialog() {
    this.dialogRef.close('open-login-dialog');
  }

}
