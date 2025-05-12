import { Component, inject, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EnrollmentService } from '../../../core/services/course/enrollment.service';
import { CourseService } from '../../../core/services/course/course.service';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { Course } from '../../../core/models/course.models';
import { Enrollment } from '../../../core/models/user.models';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { LayoutService } from '../../../core/services/config/layout.service';
import { ConfigService } from '../../../core/services/config/config.service';

@Component({
  selector: 'app-course-review',
  templateUrl: './course-review.component.html',
  styleUrl: './course-review.component.css',
  imports: [DateFormatPipe, RouterLink, ReactiveFormsModule]
})
export class CourseReviewComponent implements OnDestroy {
  private readonly enrollmentService: EnrollmentService = inject(EnrollmentService);
  private readonly layoutService: LayoutService = inject(LayoutService);
  private readonly courseService: CourseService = inject(CourseService);
  private readonly configService: ConfigService = inject(ConfigService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly fb: FormBuilder = inject(FormBuilder);

  protected readonly hostUrl: string = this.configService.getApiUrl();

  course: Course | null = null;
  enrollment: Enrollment | null = null;
  submitted = false;
  currentHoverRating = 0;
  showToast: boolean = false;
  errorMessage: string = '';
  reviewForm: FormGroup = this.fb.group({
    rating: [0, [Validators.required, Validators.min(1)]],
    comment: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
  });;

  constructor() {
    this.layoutService.hide();
    const courseId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadData(courseId);
  }

  private loadData(courseId: number) {
    this.courseService.findById(courseId).subscribe({
      next: (response) => {
        this.course = response;
        this.enrollmentService.findById(courseId).subscribe({
          next: (response) => {
            this.enrollment = response;
          },
          error: (error: string) => {
            this.errorMessage = error;
            this.showToast = true;
          }
        })
      },
      error: (error: string) => {
        this.errorMessage = error;
        this.showToast = true;
      }
    })
  }

  setRating(rating: number) {
    this.reviewForm.patchValue({ rating });
    this.currentHoverRating = 0; // Reset hover state after selection
  }

  setHoverRating(rating: number) {
    if (this.reviewForm.get('rating')?.value === 0)
      this.currentHoverRating = rating;
  }

  resetHoverRating() {
    this.currentHoverRating = 0;
  }

  onSubmit() {
    if (this.reviewForm.valid) {
      this.submitted = true;

      // In a real app, you would send this data to your backend
      console.log('Review submitted:', this.reviewForm.value);
    } else {
      this.reviewForm.markAllAsTouched();
    }
  }

  getStarsArray() {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  ngOnDestroy(): void {
    this.layoutService.show();
  }

}