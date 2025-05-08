import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { Enrollment } from '../../../core/models/user.models';
import { EnrollmentService } from '../../../core/services/course/enrollment.service';
import { CertificateService } from '../../../core/services/course/certificate.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { UserDetails } from '../../../core/models/auth.models';

interface Tab {
  id    : string;
  label : string;
}

@Component({
  selector    : 'app-dashboard',
  templateUrl : './dashboard.component.html',
  styleUrl    : './dashboard.component.css',
  imports     : [
    RouterLink,
    DateFormatPipe
  ]
})
export class DashboardComponent {
  private readonly enrollment  : EnrollmentService  = inject(EnrollmentService);
  private readonly certificate : CertificateService = inject(CertificateService);
  private readonly auth        : AuthService        = inject(AuthService);

  enrollments: WritableSignal<Enrollment[]>  = signal<Enrollment[]>([]);
  enrollmentsActive    = computed(() => this.enrollments().filter(e => (!e.isArchived && !e.isCompleted) || (!e.isArchived && !e.isCompleted && e.isFavorite)));
  enrollmentsCompleted = computed(() => this.enrollments().filter(e => e.isCompleted));
  enrollmentsFavorites = computed(() => this.enrollments().filter(e => e.isFavorite && !e.isArchived));
  enrollmentsArchived  = computed(() => this.enrollments().filter(e => e.isArchived));
  user: Signal<UserDetails | null> = this.auth.user;
  activeTab: string = 'courses';
  loading = signal(false);
  error = signal(false);
  tabs: Tab[] = [
    { id: 'courses',   label: 'Courses'   },
    { id: 'favorites', label: 'Favorites' },
    { id: 'archived',  label: 'Archived'  },
    { id: 'completed', label: 'Completed' }
  ];

  constructor() {
    this.loadData();
  }

  private loadData() {
    this.enrollment.findAll().subscribe({
      next: (response) => {
        this.enrollments.set(response);
      }
    })
  }

  downloadCert(enrollment: Enrollment) {
    if (!enrollment.isCompleted)
      return;

    this.loading.set(true);
    this.error.set(false);

    const certificateData = {
      userName   : this.user()?.firstname! + ' ' + this.user()?.lastname!,
      userDni    : this.user()?.dni!,
      enrollment : enrollment
    };

    this.certificate.generate(certificateData);

    this.loading.set(false);

    // reaccionar cuando el PDF esté listo ?
  }

  setIsFavorite(courseId: number, isFavorite: boolean) {
    this.enrollment.patchFavorite(courseId, isFavorite).subscribe({
      next: (response) => {
        this.enrollments.update((current) =>
          current.map(e => e.course.id === courseId ? response : e)
        );
      }
    });
  }

  setIsArchived(courseId: number, isArchived: boolean) {
    this.enrollment.patchArchived(courseId, isArchived).subscribe({
      next: (response) => {
        this.enrollments.update((current) =>
          current.map(e => e.course.id === courseId ? response : e)
        );
      }
    });
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

}