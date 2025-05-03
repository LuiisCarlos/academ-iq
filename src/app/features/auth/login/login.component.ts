import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth/auth.service';
import { LayoutService } from '../../../core/services/config/layout.service';
import { ConfigService } from '../../../core/services/config/config.service';

@Component({
  selector    : 'app-login-dialog',
  templateUrl : './login.component.html',
  styleUrl    : './login.component.css',
  imports     : [
    RouterLink,
    CommonModule,
    ReactiveFormsModule
  ]
})
export class LoginComponent {
  private readonly layoutService : LayoutService = inject(LayoutService);
  private readonly authService   : AuthService   = inject(AuthService);
  private readonly configService : ConfigService = inject(ConfigService);
  private readonly router        : Router        = inject(Router);

  protected readonly hostUrl: string = this.configService.getApiUrl();

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

  constructor() {
    this.layoutService.hideLayout();
  }

  submit() {
    const { username, password } = this.loginForm.value;

    this.loading = true;
    this.authService.login(username as string, password as string).subscribe({
      next: () => {
        this.authService.loadUser().subscribe();
        this.router.navigate(['users/dashboard'])
      },
      error: (error) => {
        this.errorMessage = 'Oops! An unexpected error occurred. Please try again later.' + error;
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
