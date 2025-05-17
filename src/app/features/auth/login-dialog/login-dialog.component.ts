import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth/auth.service';
import { ConfigService } from '../../../core/services/config/config.service';
import { ToastService } from '../../../core/services/toast.service';

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
  private readonly toast         : ToastService  = inject(ToastService);
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
/*       error: (error) => {
        this.toast.show(error.error.message, 'error');
      }, */
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
