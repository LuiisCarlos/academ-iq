import { Component, Input, Output, EventEmitter, inject } from '@angular/core';

import { UserService } from '../../../core/services/user.service';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-avatar-upload',
  templateUrl: './avatar-upload.component.html',
  imports: [ToastComponent]
})
export class AvatarUploadComponent {
  private readonly userService: UserService = inject(UserService);

  @Input() currentAvatarUrl: string | null = null;
  @Output() uploadComplete = new EventEmitter<string>();

  showToast: boolean = false;
  previewUrl: string | null = null;
  isLoading = false;
  errorMessage = '';


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Only Allowed images (JPEG, PNG)';
      this.showToast = true;
      return;
    }

    this.previewUrl = URL.createObjectURL(file);
    this.uploadFile(file);
  }

  uploadFile(file: File) {
    this.showToast = false;
    this.isLoading = true;

    this.userService.patchAvatar(file).subscribe({
      next: (response: any) => {
        this.uploadComplete.emit(response.avatarUrl);
        this.isLoading = false;
      },
      error: (error: string) => {
        this.errorMessage = error;
        this.isLoading = false;
        this.previewUrl = null;
        this.showToast = true;
      }
    });
  }

}
