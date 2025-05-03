import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth/auth.service';
import { ConfigService } from '../../../core/services/config/config.service';

@Component({
  selector    : 'app-login-dialog',
  templateUrl : './login-dialog.component.html',
  styleUrl    : './login-dialog.component.css',
  imports     : [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule
  ]
})
export class LoginDialogComponent {
  private readonly dialogRef     : MatDialogRef<LoginDialogComponent> = inject(MatDialogRef);
  private readonly authService   : AuthService   = inject(AuthService);
  private readonly configService : ConfigService = inject(ConfigService);
  private readonly router        : Router        = inject(Router);

  protected readonly hostUrl = this.configService.getApiUrl();

  readonly loginForm = new FormGroup({
    username: new FormControl('', {
      validators  : [Validators.required],
      nonNullable : true,
    }),
    password: new FormControl('', {
      validators  : [Validators.required],
      nonNullable : true,
    }),
  });

  errorMessage : string  = '';
  loading      : boolean = false;

  submit() {
    const { username, password } = this.loginForm.value;

    this.loading = true;
    this.authService.login(username as string, password as string).subscribe({
      next: () => {
        this.authService.loadUser().subscribe();
        this.dialogRef.close();
        this.router.navigate(['users/dashboard'])
      },
      error: (error) => {
        this.errorMessage = error;
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  openRegisterDialog() {
    this.dialogRef.close('open-register-dialog');
  }

  openForgotPasswordDialog() {
    this.dialogRef.close('open-forgot-password-dialog');
  }

}
