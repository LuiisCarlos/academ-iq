import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private showLayoutSubject = new BehaviorSubject<boolean>(true);
  showLayout$ = this.showLayoutSubject.asObservable();

  show() {
    this.showLayoutSubject.next(true);
  }

  hide() {
    this.showLayoutSubject.next(false);
  }

}