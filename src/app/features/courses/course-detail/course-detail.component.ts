import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CourseAccordionComponent } from '../course-accordion/course-accordion.component';
import { CourseService } from '../../../core/services/course/course.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';
import { EnrollmentService } from '../../../core/services/course/enrollment.service';
import { Enrollment } from '../../../core/models/user.models';
import { RatingStatsPipe } from '../../../shared/pipes/rating-stats.pipe';
import { Course } from '../../../core/models/course.models';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

interface Tab {
  id    : string;
  label : string;
}

@Component({
  selector    : 'app-course-detail',
  templateUrl : './course-detail.component.html',
  styleUrl    : './course-detail.component.css',
  imports     : [
    TimeAgoPipe,
    CommonModule,
    TimeFormatPipe,
    CourseAccordionComponent,
    ToastComponent
  ]
})
export class CourseDetailComponent {
  private readonly enrollmentService : EnrollmentService = inject(EnrollmentService);
  private readonly courseService     : CourseService     = inject(CourseService);
  private readonly route             : ActivatedRoute    = inject(ActivatedRoute);
  private readonly authService       : AuthService       = inject(AuthService);
  private readonly router            : Router            = inject(Router);

  showAllComments    : WritableSignal<boolean> = signal(false);

  course             : Course            = { } as Course;
  enrollment         : Enrollment | null = null;
  maxVisibleComments : number  = 3;
  activeTab          : string  = 'sections';
  loading            : boolean = false;
  showToast          : boolean = false;
  errorMessage       : string  = '';
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

  setIsFavorite(courseId: number, isFavorite: boolean) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.enrollmentService.update(courseId, { isFavorite }).subscribe({
      next: (response) => {
        this.enrollment = response;
      },
      error: () => {
        this.enrollUser(courseId, true);
      }
    });
  }

  enrollUser(courseId: number, isFavorite?: boolean) {
    this.loading = true;
    this.showToast = false;
    if (this.enrollment === null) {
      this.enrollmentService.create(courseId, { isFavorite }).subscribe({
        next: (response) => {
          this.enrollment = response;
          this.router.navigate(['/courses', courseId, 'watch']);
        },
        error: (error: string) => {
          this.errorMessage = error;
          this.showToast = true;
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      this.router.navigate(['/courses', courseId, 'watch']);
    }
  }


  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

}
