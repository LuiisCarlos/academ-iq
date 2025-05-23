import { Component, inject, OnInit } from '@angular/core';

import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html'
})
export class ToastComponent implements OnInit {
  private readonly toastService: ToastService = inject(ToastService);

  message : string = '';
  visible : boolean = false;
  type    : 'success' | 'error' | 'warning' | 'info' = 'info';

  ngOnInit() {
    this.toastService.toast$.subscribe(({ message, type }) => {
      this.message = message;
      this.type = type;
      this.visible = true;

      setTimeout(() => this.visible = false, 10000);
    });
  }

  closeToast(): void {
    this.visible = false;
  }

  getToastStyles(): any {
    const styles = {
      error: {
        bg: 'bg-red-100',
        border: 'border-red-400',
        text: 'text-red-600',
        iconBg: 'bg-red-600',
        iconPath: 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2m5 13.59L15.59 17L12 13.41L8.41 17L7 15.59L10.59 12L7 8.41L8.41 7L12 10.59L15.59 7L17 8.41L13.41 12z'
      },
      success: {
        bg: 'bg-green-100',
        border: 'border-green-400',
        text: 'text-green-600',
        iconBg: 'bg-green-600',
        iconPath: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
      },
      warning: {
        bg: 'bg-yellow-100',
        border: 'border-yellow-400',
        text: 'text-yellow-600',
        iconBg: 'bg-yellow-600',
        iconPath: 'M1 21h22L12 2L1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'
      },
      info: {
        bg: 'bg-blue-100',
        border: 'border-blue-400',
        text: 'text-blue-600',
        iconBg: 'bg-blue-600',
        iconPath: 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8z'
      }
    };

    return styles[this.type] || styles.info;
  }

}
