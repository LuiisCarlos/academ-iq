import { Component, inject} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector : 'app-verify',
  template : ``,
})
export class VerifyComponent {
  private readonly route  : ActivatedRoute = inject(ActivatedRoute);
  private readonly router : Router         = inject(Router);
  private readonly auth   : AuthService    = inject(AuthService);
  private readonly toast  : ToastService   = inject(ToastService);

  constructor() {
    const verifyToken: string = this.route.snapshot.queryParamMap.get('token') ?? '';

    this.verifyAccount(verifyToken);
  }

  verifyAccount(token: string) {
    this.auth.verify(token).subscribe({
      next: () => {
        this.toast.show('Your account has been successfully verified', 'success');
      },
      error: (error) => {
        const message = error.error.message ?? 'An unexpected error occurred. Please, try again later.';
        this.toast.show(message, 'error');
      },
      complete: () => {
        this.router.navigate(['/home']);
      }
    });
  }

}