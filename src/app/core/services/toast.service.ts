import { inject, Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly zone = inject(NgZone);

  private toastSubject = new Subject<{ message: string, type: 'success' | 'error' | 'warning' | 'info' }>();

  toast$ = this.toastSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    this.zone.run(() => {
      this.toastSubject.next({ message, type });
    });
  }

}

