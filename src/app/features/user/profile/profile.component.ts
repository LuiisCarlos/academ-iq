import { Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { UserDetails } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Enrollment } from '../../../core/models/user-course.models';
import { EnrollmentService } from '../../../core/services/user-course/enrollment.service';
import { CertificateService } from '../../../core/services/course/certificate.service';
import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';
import { ToastService } from '../../../core/services/toast.service';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  imports: [
    FormsModule,
    DateFormatPipe,
    TimeFormatPipe
  ]
})
export class ProfileComponent {
  private readonly auth: AuthService = inject(AuthService);
  private readonly enrollment: EnrollmentService = inject(EnrollmentService);
  private readonly certificate: CertificateService = inject(CertificateService);
  private readonly toast : ToastService = inject(ToastService);

  user: Signal<UserDetails | null> = this.auth.user;
  enrollments: WritableSignal<Enrollment[]> = signal<Enrollment[]>([]);
  enrollmentsCompleted = computed(() => this.enrollments().filter(e => e.isCompleted));

  filteredEnrollments: Enrollment[] = [];
  loading: boolean = false;
  searchQuery: string = '';

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.enrollment.findAll().subscribe({
      next: (response) => {
        this.enrollments.set(response);
        this.filteredEnrollments = this.enrollmentsCompleted();
      }
    })
  }

  downloadCert(enrollment: Enrollment): void {
    this.loading = true;

    const certificateData = {
      userName: this.user()?.firstname! + ' ' + this.user()?.lastname!,
      userDni: this.user()?.dni!,
      enrollment: enrollment
    };

    this.certificate.generate(certificateData);
    this.loading = false;

    this.toast.show('Succesfully downloaded certificate', 'success');
  }

  filterCertificates() {
    if (!this.searchQuery) {
      this.filteredEnrollments = this.enrollmentsCompleted();
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredEnrollments = this.enrollmentsCompleted().filter(enrollment =>
      enrollment.course.title.toLowerCase().includes(query) ||
      enrollment.course.category.toLowerCase().includes(query)
    );
  }

}
