import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { passwordsMatchValidator } from '../../../shared/validators/match-password.validator';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LayoutService } from '../../../core/services/config/layout.service';
import { ConfigService } from '../../../core/services/config/config.service';
import { UserRegisterDto } from '../../../core/models/auth.models';

@Component({
  selector    : 'app-register',
  templateUrl : './register.component.html',
  styleUrl    : './register.component.css',
  imports     : [
    RouterLink,
    CommonModule,
    ReactiveFormsModule
  ]
})
export class RegisterComponent {
  private readonly layout : LayoutService = inject(LayoutService);
  private readonly config : ConfigService = inject(ConfigService);
  private readonly auth   : AuthService   = inject(AuthService);

  protected readonly hostUrl: string = this.config.getApiUrl();

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
      validators  : [ Validators.required, Validators.minLength(6), ],  // TODO: Password pattern
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
  errorMessage   : string  = '';
  loading        : boolean = false;

  constructor() {
    this.layout.hide();
  }

  submit() {
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

    this.loading = true;
    this.auth.register(registerData).subscribe({
      next: () => {
        this.successMessage = ` You have successfully registered.
          A verification e-mail has been sent to your e-mail address.
          Please follow the instructions in the e-mail to complete your registration.`
      },
      error: () => {
        this.errorMessage = 'Oops! An unexpected error occurred. Please try again later.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.layout.show();
  }

}
