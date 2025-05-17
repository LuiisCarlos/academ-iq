import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { LayoutService } from '../../../core/services/config/layout.service';
import { ConfigService } from '../../../core/services/config/config.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector    : 'app-reset-password',
  templateUrl : './reset-password.component.html',
  styleUrl    : './reset-password.component.css',
  imports     : [
    CommonModule,
    RouterLink,
    ReactiveFormsModule
  ]
})
export class ResetPasswordComponent implements OnDestroy {
  private readonly layout : LayoutService  = inject(LayoutService);
  private readonly auth   : AuthService    = inject(AuthService);
  private readonly config : ConfigService  = inject(ConfigService);
  private readonly route  : ActivatedRoute = inject(ActivatedRoute);
  private readonly toast  : ToastService   = inject(ToastService);
  private readonly fb     : FormBuilder    = inject(FormBuilder);
  private readonly router : Router         = inject(Router);

  protected readonly apiUrl: string = this.config.getApiUrl();

  recoverToken   : string = ''
  loading        : boolean = false;
  successMessage : string = '';
  toastTimeout   : any;
  resetPasswordForm: FormGroup = this.fb.group({
    newPassword     : ['', Validators.required],
    confirmPassword : ['', Validators.required]
  });

  constructor() {
    this.recoverToken = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.layout.hide();
  }

  ngOnDestroy(): void {
    this.layout.show();
  }

  onSubmit() {
    this.loading = true;
    if (this.isFormValid()) {
      const formValue: any = this.resetPasswordForm.value;
      this.auth.resetPassword(this.recoverToken, formValue.newPassword, formValue.confirmPassword)
        .subscribe({
          error: (error) => {
            this.toast.show(error.error.message, 'error');
          },
          complete: () => {
            this.loading = false;
            this.router.navigate(['/auth/login']);
          }
        })
    }
  }

  isFormValid(): boolean {
    const formValue: any = this.resetPasswordForm.value;
    return this.resetPasswordForm.value.newPassword.length >= 8 &&
    formValue.newPassword === formValue.newPassword&&
           this.hasUpperCase(formValue.newPassword) &&
           this.hasNumber(formValue.newPassword);
  }

  hasUpperCase(str: string): boolean {
    return /[A-Z]/.test(str);
  }

  hasNumber(str: string): boolean {
    return /[0-9]/.test(str);
  }

  // [FUNCIONALIDAD: Agregar manejo de visibilidad de contraseña]
  togglePasswordVisibility(fieldId: string) {
    const field = document.getElementById(fieldId) as HTMLInputElement;
    field.type = field.type === 'password' ? 'text' : 'password';
  }

}
