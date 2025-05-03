import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CourseAccordionComponent } from '../course-accordion/course-accordion.component';
import { FormatStringToTimePipe } from '../../../shared/pipes/format-string-to-time.pipe';
import { RatingStatsPipe } from '../../../shared/pipes/rating-stats.pipe';
import { CourseService } from '../../../core/services/course.service';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { UserService } from '../../../core/services/user.service';
import { Enrollment } from '../../../core/models/user.models';
import { Course } from '../../../core/models/course.models';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { AuthService } from '../../../core/services/auth/auth.service';

interface Tab {
  id    : string;
  label : string;
}

@Component({
  selector    : 'app-course-detail',
  templateUrl : './course-detail.component.html',
  styleUrl    : './course-detail.component.css',
  imports     : [
    RouterLink,
    TimeAgoPipe,
    CommonModule,
    FormatStringToTimePipe,
    CourseAccordionComponent
  ]
})
export class CourseDetailComponent {
  private readonly enrollmentService : EnrollmentService = inject(EnrollmentService);
  private readonly courseService     : CourseService     = inject(CourseService);
  private readonly route             : ActivatedRoute    = inject(ActivatedRoute);
  private readonly authService       : AuthService       = inject(AuthService);
  private readonly router            : Router            = inject(Router);

  showAllComments    : WritableSignal<boolean> = signal(false);
  course             : Course     = { } as Course;
  enrollment         : Enrollment = { } as Enrollment;
  maxVisibleComments : number     = 3;
  activeTab          : string     = 'sections';
  tabs: Tab[] = [
    { id: 'sections', label: 'Sections' },
    { id: 'ratings',  label: 'Ratings'  }
  ];
  ratingStats = computed(() => {
    const pipe = new RatingStatsPipe();
    return pipe.transform(this.course?.ratings);
  });
  visibleComments = computed(() => {
    const allComments = this.course?.ratings?.filter(r => r.comment) || [];
    return this.showAllComments() ? allComments : allComments.slice(0, this.maxVisibleComments);
  });
  hasHiddenComments = computed(() => {
    const allComments = this.course?.ratings?.filter(r => r.comment) || [];
    return allComments.length > this.maxVisibleComments;
  })

  constructor() {
    const courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData(courseId);
  }

  loadData(courseId: number): void {
    this.courseService.findById(courseId).subscribe({
      next: (response) => {
        this.course = response;
        this.enrollmentService.findById(response.id).subscribe({
          next: (response) => {
            this.enrollment = response;
          }
        })
      }
    });
  }

  toggleComments() {
    this.showAllComments.update(value => !value);
  }

  setIsFavorite(enrollmentId: number, isFavorite: boolean) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.enrollmentService.updateFavorite(enrollmentId, isFavorite).subscribe({
      next: () => {
        this.loadData(this.course.id);
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

}
