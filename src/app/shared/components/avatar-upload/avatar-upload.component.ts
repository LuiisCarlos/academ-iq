import { Component, Input, Output, EventEmitter, inject } from '@angular/core';

import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-avatar-upload',
  templateUrl: './avatar-upload.component.html',
})
export class AvatarUploadComponent {
  private readonly userService: UserService = inject(UserService);
  private readonly toast      : ToastService = inject(ToastService);

  @Input() currentAvatarUrl: string | null = null;
  @Output() uploadComplete = new EventEmitter<string>();

  previewUrl: string | null = null;
  isLoading = false;

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
    this.isLoading = true;

    this.userService.patchAvatar(file).subscribe({
      next: (response: any) => {
        this.uploadComplete.emit(response.avatarUrl);
        this.isLoading = false;
      },
      error: (error) => {
        const message = error.error.message ?? 'An unexpected error occurred. Please, try again later.';
        this.toast.show(message, 'error');
      },
      complete: () => {
        this.isLoading = false;
        this.previewUrl = null;
      }
    });
  }

}
