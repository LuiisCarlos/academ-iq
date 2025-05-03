import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { UserService } from '../../../core/services/user.service';
import { Enrollment } from '../../../core/models/user.models';
import { EnrollmentService } from '../../../core/services/enrollment.service';

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
  private readonly enrollmentService : EnrollmentService = inject(EnrollmentService);

  enrollments: WritableSignal<Enrollment[]>  = signal<Enrollment[]>([]);
  enrollmentsActive    = computed(() => this.enrollments().filter(e => (!e.isArchived && !e.isCompleted) || (!e.isArchived && e.isFavorite)));
  enrollmentsCompleted = computed(() => this.enrollments().filter(e => e.isCompleted));
  enrollmentsFavorites = computed(() => this.enrollments().filter(e => e.isFavorite));
  enrollmentsArchived  = computed(() => this.enrollments().filter(e => e.isArchived));
  activeTab: string = 'courses';
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
    this.enrollmentService.findAll().subscribe({
      next: (response) => {
        this.enrollments.set(response);
        console.log(response);
      }
    })
  }

  setIsFavorite(enrollmentId: number, isFavorite: boolean) {
    this.enrollmentService.updateFavorite(enrollmentId, isFavorite).subscribe({
      next: () => {
        this.loadData();
      }
    });
  }

  setIsArchived(enrollmentId: number, isArchived: boolean) {
    this.enrollmentService.updateArchived(enrollmentId, isArchived).subscribe({
      next: () => {
        this.loadData();
      }
    });
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

}