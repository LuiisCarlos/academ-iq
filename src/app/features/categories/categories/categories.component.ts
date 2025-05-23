import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../../core/models/course.models';
import { CourseService } from '../../../core/services/course/course.service';

@Component({
  selector    : 'app-categories',
  templateUrl : './categories.component.html',
  styleUrl    : './categories.component.css',
  imports     : [RouterLink]
})
export class CategoriesComponent {
  private readonly course: CourseService = inject(CourseService);

  categories: Category[] = [];
  loading: boolean = false;

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true
    this.course.findAllCategories().subscribe({
      next: (response) => {
        this.categories = response;
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false
      }
    })
  }

}
