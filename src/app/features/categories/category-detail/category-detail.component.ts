import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';


import { Category, Course, Rating } from '../../../core/models/course.models';
import { CourseService } from '../../../core/services/course/course.service';
import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';

@Component({
  selector    : 'app-category-detail',
  templateUrl : './category-detail.component.html',
  styleUrl    : './category-detail.component.css',
  imports     : [TimeFormatPipe, RouterLink]
})
export class CategoryDetailComponent {
  private readonly course : CourseService  = inject(CourseService);
  private readonly route  : ActivatedRoute = inject(ActivatedRoute);

  category : Category = {} as Category;
  courses  : Course[] = [] as Course[];
  ratings  : Rating[] = [] as Rating[];

  constructor() {
    const categoryName = this.route.snapshot.paramMap.get('category');

    this.loadData(categoryName as string);
  }

  loadData(categoryName: string ) {
    this.course.findCategoryByName(categoryName).subscribe({
      next: (response) => {
        this.category = response;
        this.course.findAll().subscribe({
          next: (response) => {
            this.courses = response
              .filter(c => c.category.id === this.category.id)
              .sort(() => Math.random() - 0.5)
              .slice(0, 4);;
          }
        })
      }
    })
  }


  // Flags to control sections
  showCategoryDescription = true;
  showCategoryStats = true;
  showCategoryHeroImage = true;
  showBenefitsSection = true;
  showFeaturedCourses = true;
  showInstructors = false;
  showTestimonials = false;
  showResources = false;

  // Example data structure (would come from DB)

  categoryStats = signal({
    courses: 42,
    instructors: 15,
    students: 12500
  });

  featuredCourses = signal([
    {
      id: 1,
      title: 'Advanced JavaScript',
      shortDescription: 'Master modern JavaScript concepts',
      thumbnailUrl: 'path/to/thumbnail.jpg',
      duration: 12,
      level: 'Intermediate',
      price: 89.99
    },
    {
      id: 1,
      title: 'Java from Scratch',
      shortDescription: 'Master modern Java concepts',
      thumbnailUrl: 'path/to/thumbnail.jpg',
      duration: 12,
      level: 'Intermediate',
      price: 99.99
    },
    // ...more courses
  ]);

  categoryResources = signal([
    {
      id: 1,
      title: 'asda',
      description: 'asfasd',
      link:'dfsd'
    }
  ]);

  categoryTestimonials = signal([
    {
      id: 1,
      name: 'asda',
      avatarUrl: 'asfasd',
      course:'dfsd',
      quote: 'bebesita',
      rating: 2,
    }
  ]);

  // ...similar signals for other sections
}
