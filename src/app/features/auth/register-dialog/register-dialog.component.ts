import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { passwordsMatchValidator } from '../../../shared/validators/match-password.validator';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ConfigService } from '../../../core/services/config/config.service';
import { UserRegisterDto } from '../../../core/models/auth.models';
import { ToastService } from '../../../core/services/toast.service';


@Component({
  selector    : 'app-register-dialog',
  templateUrl : './register-dialog.component.html',
  styleUrl    : './register-dialog.component.css',
  imports     : [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule
  ]
})
export class RegisterDialogComponent {
  private readonly dialogRef     : MatDialogRef<RegisterDialogComponent> = inject(MatDialogRef);
  private readonly configService : ConfigService = inject(ConfigService);
  private readonly authService   : AuthService   = inject(AuthService);
  private readonly toast         : ToastService  = inject(ToastService);

  protected readonly hostUrl: string = this.configService.getApiUrl();

  readonly signupForm = new FormGroup({
    username: new FormControl('', {
      validators  : [Validators.required],
      nonNullable : true,
    }),
    email: new FormControl('', {
      validators  : [Validators.required, Validators.email],
      nonNullable : true
    }),
    password: new FormControl('', {
      validators  : [ Validators.required], // TODO: Password pattern
      nonNullable : true,
    }),
    confirmPassword: new FormControl('', {
      validators  : [Validators.required],
      nonNullable : true,
    }),
    firstname : new FormControl(''),
    lastname  : new FormControl(''),
    birthdate : new FormControl('', {
      validators  : [Validators.required],
      nonNullable : true,
    })
  }, { validators: passwordsMatchValidator() });

  successMessage : string  = '';
  loading        : boolean = false;

  onSubmit() {
    this.loading = true;

    const formValue = this.signupForm.value;
    const registerData: UserRegisterDto = {
      username        : formValue.username!,
      password        : formValue.password!,
      confirmPassword : formValue.confirmPassword!,
      email           : formValue.email!,
      firstname       : formValue.firstname || '',
      lastname        : formValue.lastname || '',
      birthdate       : formValue.birthdate!,
    };

    if (this.signupForm.errors) {
      this.toast.show('Please check your input', 'error');
    }

    this.authService.register(registerData).subscribe({
      next: () => {
        this.successMessage = `You have successfully registered.
          A verification e-mail has been sent to your e-mail address.
          Please follow the instructions in the e-mail to complete your registration.`
      },
      error: (error) => {
        this.toast.show(error.error.message, 'error');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  openLoginDialog() {
    this.dialogRef.close('open-login-dialog');
  }

}
