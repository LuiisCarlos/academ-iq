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
  private readonly layout : LayoutService = inject(LayoutService);
  private readonly auth   : AuthService   = inject(AuthService);
  private readonly config : ConfigService = inject(ConfigService);
  private readonly router : Router        = inject(Router);

  protected readonly hostUrl: string = this.config.getApiUrl();

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
    this.layout.hide();
  }

  submit() {
    const { username, password } = this.loginForm.value;

    this.loading = true;
    this.auth.login(username as string, password as string).subscribe({
      next: () => {
        this.auth.loadUser().subscribe();
        this.router.navigate(['users/dashboard'])
      },
      error: (error: string) => {
        this.errorMessage = error;
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
