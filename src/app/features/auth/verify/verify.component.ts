import { Component, inject} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

type ToastType = 'error' | 'success' | 'warning' | 'info';

@Component({
  selector    : 'app-verify',
  templateUrl : './verify.component.html',
  styleUrl    : './verify.component.css',
  imports     : [ToastComponent]
})
export class VerifyComponent {
  private readonly route  : ActivatedRoute = inject(ActivatedRoute);
  private readonly router : Router         = inject(Router);
  private readonly auth   : AuthService    = inject(AuthService);

  showToast : boolean = false;
  message   : string = '';
  type      : ToastType | null = null;

  constructor() {
    const verifyToken: string = this.route.snapshot.queryParamMap.get('token') ?? '';

    this.verifyAccount(verifyToken);
  }

  verifyAccount(token: string) {
    this.auth.verify(token).subscribe({
      next: () => {
        this.type = 'success';
        this.router.navigate(['/auth/login']);
        this.message = 'You account has been successfully verified';
        this.showToast = true;
      },
      error: (error: string) => {
        this.router.navigate(['/home']);
        this.type = 'error';
        this.message = error ?? 'An unexpected error occurred. Please, try again later.';
        this.showToast = true;
      }
    });
  }

}