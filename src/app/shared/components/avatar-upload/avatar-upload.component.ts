import { Component, Input, Output, EventEmitter, inject } from '@angular/core';

import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-avatar-upload',
  templateUrl: './avatar-upload.component.html',
})
export class AvatarUploadComponent {
  private readonly authService : AuthService  = inject(AuthService);
  private readonly userService : UserService  = inject(UserService);
  private readonly toast       : ToastService = inject(ToastService);

  @Input() currentAvatarUrl: string | null = null;
  @Output() uploadComplete = new EventEmitter<string>();

  previewUrl: string | null = null;
  loading = false;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toast.show('Only Allowed images (JPEG, PNG)', 'error');
      return;
    }

    this.previewUrl = URL.createObjectURL(file);
    this.uploadFile(file);
  }

  uploadFile(file: File) {
    this.loading = true;

    this.userService.patchAvatar(file).subscribe({
      next: (response) => {
        this.authService.loadUser().subscribe();
        this.currentAvatarUrl = response.url;
        this.uploadComplete.emit(response.url);
      },
      error: (error) => {
        const message = error.error.message ?? 'An unexpected error occurred. Please, try again later.';
        this.toast.show(message, 'error');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.previewUrl = null;
      }
    });
  }

}
