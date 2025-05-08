import { Component, inject, signal, WritableSignal } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EnrollmentService } from '../../../core/services/course/enrollment.service';
import { CourseService } from '../../../core/services/course/course.service';
import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Category, Course } from '../../../core/models/course.models';
import { Enrollment } from '../../../core/models/user.models';

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
  private readonly router: Router = inject(Router);

  courses       : WritableSignal<Course[]>     = signal<Course[]>([]);
  categories    : WritableSignal<Category[]>   = signal<Category[]>([]);
  enrollments   : WritableSignal<Enrollment[]> = signal<Enrollment[]>([]);
  levels        : string[] = ['Beginner', 'Intermediate', 'Advanced'];
  currentRating : number   = 0;
  hoverRating   : number   = 0;
  pageSize = signal(24);
  pageIndex = signal(0);
  pageSizeOptions = signal([24]);
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
    this.courseService.findAll().subscribe({
      next: (response) => {
        this.courses.set(response);
      }
    });

    this.courseService.findAllCategories().subscribe({
      next: (response) => {
        this.categories.set(response);
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

    this.enrollmentService.patchFavorite(courseId, isFavorite).subscribe({
      next: (response) => {
        this.enrollments.update((current) =>
          current.map(e => e.course.id === courseId ? response : e)
        );
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