import { Component, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { Enrollment } from '../../../core/models/user-course.models';
import { EnrollmentService } from '../../../core/services/user-course/enrollment.service';
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
  error = signal(false);

  activeTab : string  = 'courses';
  loading   : boolean = false;
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
    this.loading = true;
    this.enrollment.findAll().subscribe({
      next: (response) => {
        this.enrollments.set(response);
      },
      complete: () => {
        this.loading = false;
      }
    })
  }

  downloadCert(enrollment: Enrollment) {
    if (!enrollment.isCompleted)
      return;

    this.error.set(false);
    const certificateData = {
      userName   : this.user()?.firstname! + ' ' + this.user()?.lastname!,
      userDni    : this.user()?.dni!,
      enrollment : enrollment
    };

    this.certificate.generate(certificateData);
  }

  setIsFavorite(courseId: number, isFavorite: boolean) {
    this.enrollment.update(courseId, { isFavorite }).subscribe({
      next: (response) => {
        this.enrollments.update((current) =>
          current.map(e => e.course.id === courseId ? response : e)
        );
      }
    });
  }

  setIsArchived(courseId: number, isArchived: boolean) {
    this.enrollment.update(courseId, { isArchived }).subscribe({
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