import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CourseService } from '../../core/services/course/course.service';
import { Category, Course } from '../../core/models/course.models';
import { ConfigService } from '../../core/services/config/config.service';

@Component({
  selector    : 'app-home',
  templateUrl : './home.component.html',
  styleUrl    : './home.component.css',
  imports     : [
    RouterLink,
    CommonModule
  ]
})
export class HomeComponent {
  private readonly course : CourseService = inject(CourseService);
  private readonly config : ConfigService = inject(ConfigService);

  protected readonly apiUrl: string = this.config.getApiUrl();

  duplicatedCategories = computed(() => [...this.categories(), ...this.categories(), ...this.categories(), ...this.categories(), ...this.categories()]);
  shuffled = computed(() => [...this.courses()].sort(() => 0.5 - Math.random()).slice(0, 4));
  courses   : WritableSignal<Course[]> = signal<Course[]>([]);
  categories: WritableSignal<Category[]> = signal<Category[]>([]);

  appName   : string = 'Academ-IQ';
  appSlogan : string = 'Shape Today. Own Tomorrow.';
  scale     : number = 1;
  opacity   : number = 1;
  activeTab = 'certification';

  tabs = [
    {
      id: 'certification',
      imageUrl: 'https://res.cloudinary.com/duu4u98gb/image/upload/v1747091207/academiq-certificates_rdjai9.png',
      title: 'Professional Certification',
      description: 'Earn recognized certificates upon course completion',
      longDescription: 'Our certifications are industry-validated and demonstrate your mastery in each area. Complete all modules and exams to receive your digital certificate, which you can share on LinkedIn and other professional networks.',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
    },
  ];


  constructor() {
    this.loadData();
  }

  private loadData() {
    this.course.findAll().subscribe({
      next: (response) => { this.courses.set(response); }
    });

    this.course.findAllCategories().subscribe({
      next: (response) => { this.categories.set(response); }
    });
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  getActiveTab() {
    return this.tabs.find(tab => tab.id === this.activeTab) || this.tabs[0];
  }

}
