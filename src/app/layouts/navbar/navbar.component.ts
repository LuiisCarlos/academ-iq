import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Component, HostListener, inject, input, Signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ForgotPasswordDialogComponent } from '../../features/auth/forgot-password-dialog/forgot-password-dialog.component';
import { RegisterDialogComponent } from '../../features/auth/register-dialog/register-dialog.component';
import { LoginDialogComponent } from '../../features/auth/login-dialog/login-dialog.component';
import { AuthService } from '../../core/services/auth/auth.service';
import { ConfigService } from '../../core/services/config/config.service';
import { UserDetails } from '../../core/models/auth.models';

@Component({
  selector    : 'app-navbar',
  templateUrl : './navbar.component.html',
  styleUrl    : './navbar.component.css',
  imports     : [
    RouterLink,
    MatDialogModule
  ]
})
export class NavbarComponent {
  private readonly configService : ConfigService = inject(ConfigService);
  private readonly router        : Router        = inject(Router);

  protected readonly authService : AuthService   = inject(AuthService);
  protected readonly hostUrl     : string        = this.configService.getApiUrl();

  private dialog: MatDialog = inject(MatDialog);

  user   : Signal<UserDetails | null> = this.authService.user;

  isOpen    : boolean = false;
  isMenuOpen: boolean = false;

  openRegisterDialog() {
    const dialogRef = this.dialog.open(RegisterDialogComponent, {
      panelClass : 'custom-dialog',
      maxWidth   : '100%',
      height     : '50rem',
      width      : '65rem'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'open-login-dialog')
        this.openLoginDialog();
    });
  }

  openLoginDialog() {
    const dialogRef = this.dialog.open(LoginDialogComponent, {
      panelClass : 'custom-dialog',
      maxWidth   : '100%',
      height     : '40rem',
      width      : '65rem'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'open-register-dialog')
        this.openRegisterDialog();
      else if (result === 'open-forgot-password-dialog')
        this.openForgotPasswordDialog();
    });
  }

  openForgotPasswordDialog() {
    const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
      panelClass : 'custom-dialog',
      maxWidth   : '100%',
      height     : '40rem',
      width      : '65rem'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'open-register-dialog')
        this.openRegisterDialog();
      else if (result === 'open-login-dialog')
        this.openLoginDialog();
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('app-navbar')) {
      this.isOpen = false;
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['home'])
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    // Controlar el scroll del body
    if (this.isMenuOpen) {
        document.body.classList.add('menu-open');
    } else {
        document.body.classList.remove('menu-open');
    }
}

}
