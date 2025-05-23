import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';


import { Category, Course } from '../../../core/models/course.models';
import { RatingRes } from '../../../core/models/user-course.models';
import { CourseService } from '../../../core/services/course/course.service';
import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrl: './category-detail.component.css',
  imports: [TimeFormatPipe, RouterLink]
})
export class CategoryDetailComponent {
  private readonly course: CourseService = inject(CourseService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  ratings: RatingRes[] = [] as RatingRes[];
  category: Category = {} as Category;
  courses: Course[] = [] as Course[];
  loading: boolean = false;

  constructor() {
    const categoryName = this.route.snapshot.paramMap.get('category');

    this.loadData(categoryName as string);
  }

  loadData(categoryName: string) {
    this.loading = true;

    this.course.findCategoryByName(categoryName).subscribe({
      next: (response) => {
        this.category = response;
        this.course.findAll().subscribe({
          next: (response) => {
            this.courses = response
              .filter(c => c.category.id === this.category.id)
              .sort(() => Math.random() - 0.5)
              .slice(0, 8);
            this.categoryStats.courses = this.courses.length;
            this.categoryStats.instructors = this.courses
              .map(c => c.author)
              .filter((value, index, self) => self.indexOf(value) === index).length;
            this.categoryStats.students = Math.floor(Math.random() * (100 - 5 + 1)) + 5;
          },
          error: () => {
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        })
      },
    })
  }

  categoryStats = {
    courses: 42,
    instructors: 15,
    students: 12500
  };

}
