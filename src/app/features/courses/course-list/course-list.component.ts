import { Component, inject, signal, WritableSignal } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { EnrollmentService } from '../../../core/services/user-course/enrollment.service';
import { CourseService } from '../../../core/services/course/course.service';
import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Category, Course } from '../../../core/models/course.models';
import { Enrollment } from '../../../core/models/user-course.models';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector    : 'app-course-list',
  templateUrl : './course-list.component.html',
  styleUrl    : './course-list.component.css',
  imports     : [
    RouterLink,
    FormsModule,
    CommonModule,
    TimeFormatPipe,
    MatPaginatorModule
  ],
})
export class CourseListComponent {
  private readonly enrollmentService : EnrollmentService = inject(EnrollmentService);
  private readonly courseService     : CourseService     = inject(CourseService);
  private readonly authService       : AuthService       = inject(AuthService);
  private readonly toast  : ToastService = inject(ToastService);
  private readonly router : Router       = inject(Router);

  courses       : WritableSignal<Course[]>     = signal<Course[]>([]);
  categories    : WritableSignal<Category[]>   = signal<Category[]>([]);
  enrollments   : WritableSignal<Enrollment[]> = signal<Enrollment[]>([]);
  pageSize = signal(24);
  pageIndex = signal(0);
  pageSizeOptions = signal([24]);

  levels            : string[] = ['Beginner', 'Intermediate', 'Advanced'];
  currentRating     : number   = 0;
  hoverRating       : number   = 0;
  loadingCourses    : boolean  = false;
  loadingCategories : boolean  = false;
  loadingFavorite   : boolean  = false;
  filters = {
    title      : '',
    levels     : {} as {[key: string]: boolean},
    categories : {} as {[key: string]: boolean},
    rating     : 0,
  }

  constructor() {
    this.loadData();
  }

  private loadData() {
    this.loadingCategories = true;
    this.courseService.findAllCategories().subscribe({
      next: (response) => {
        this.categories.set(response);
      },
      complete: () => {
        this.loadingCategories = false
      }
    });

    this.loadingCourses = true
    this.courseService.findAll().subscribe({
      next: (response) => {
        this.courses.set(response);
      },
      complete: () => {
        this.loadingCourses = false
      }
    });

    if (this.authService.isLoggedIn()) {
      this.enrollmentService.findAll().subscribe({
        next: (response) => {
          this.enrollments.set(response);
        }
      });
    }
  }

  get filteredCourses() {
    const selectedCategories = Object.keys(this.filters.categories).filter(
      key => this.filters.categories[key]
    );

    const selectedLevels = Object.keys(this.filters.levels).filter(
      key => this.filters.levels[key]
    );

    const startIndex = this.pageIndex() * this.pageSize();

    return this.courses().filter(course =>
      course.title.toLowerCase().includes(this.filters.title.toLowerCase()) &&
      (selectedCategories.length === 0 || selectedCategories.includes(course.category.name)) &&
      (selectedLevels.length === 0 || selectedLevels.includes(course.level)) &&
      (this.filters.rating === 0 || (this.filters.rating > course.averageRating))
    ).slice(startIndex, startIndex + this.pageSize());
  }

  findOrCreateEnrollment(courseId: number) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.enrollments().some(e => e.course.id === courseId)) {
      this.enrollmentService.create(courseId).subscribe({
        next: (enrollment) => {
          this.enrollments.update(current => {
            if (current.some(e => e.course.id === courseId))
              return current.map(e => e.course.id === courseId ? enrollment : e);
            else
              return [...current, enrollment];
          });
        }
      });
    }

    this.router.navigate(['/courses', courseId, 'watch']);
  }

  handlePageEvent(event: PageEvent) {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex)
    this.scrollToTop();
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  isFavorite(courseId: number): boolean {
    if (!this.authService.isLoggedIn()) return false;
    const enrollment = this.enrollments().find(e => e.course!.id === courseId);
    return enrollment?.isFavorite || false;
  }

  resetFilters() {
    this.filters = {
      title      : '',
      levels     : {},
      categories : {},
      rating     : 0,
    };
  }

  filterCourses() {
    this.filteredCourses;
  }

  resetHover() {
    this.hoverRating = 0;
  }

  setIsFavorite(courseId: number, isFavorite: boolean) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadingFavorite = true;
    this.enrollmentService.findOrCreate(courseId).pipe(
      switchMap(enrollment => {
        return this.enrollmentService.update(enrollment.course.id, { isFavorite });
      })
    ).subscribe({
      next: (updatedEnrollment) => {
        this.enrollments.update(current => {
          if (current.some(e => e.course.id === courseId))
            return current.map(e => e.course.id === courseId ? updatedEnrollment : e);
          else
            return [...current, updatedEnrollment];
        });
      },
      error: (error) => {
        this.toast.show(error.error.message, 'error');
        this.loadingFavorite = false;
      },
      complete: () => {
        this.loadingFavorite = false;
      }
    });
  }

  setRating(star: number) {
    this.filters.rating = star;
  }

  setHover(star: number) {
    this.hoverRating = star;
  }

}