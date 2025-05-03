import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';

import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserService } from '../../../core/services/user.service';
import { UserDetails } from '../../../core/models/auth.models';
import { Enrollment } from '../../../core/models/user.models';
import { EnrollmentService } from '../../../core/services/enrollment.service';

@Component({
  selector    : 'app-profile',
  templateUrl : './profile.component.html',
  styleUrl    : './profile.component.css',
  imports     : [DateFormatPipe]
})
export class ProfileComponent {
  private readonly enrollmentService : EnrollmentService = inject(EnrollmentService);
  private readonly authService       : AuthService       = inject(AuthService);

  user        : Signal<UserDetails | null>    = this.authService.user;
  enrollments : WritableSignal<Enrollment[]>  = signal<Enrollment[]>([]);
  enrollmentsCompleted = computed(() => this.enrollments().filter(e => e.isCompleted));

  constructor() {
    this.loadData();
  }

  private loadData() {
    this.enrollmentService.findAll().subscribe({
      next: (response) => {
        this.enrollments.set(response);
      }
    })
  }

}
