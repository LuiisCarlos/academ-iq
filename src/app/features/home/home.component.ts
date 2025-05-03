import { Component, computed, HostListener, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CourseService } from '../../core/services/course.service';
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
  private readonly courseService: CourseService = inject(CourseService);
  private readonly configService: ConfigService = inject(ConfigService);

  protected readonly hostUrl: string = this.configService.getApiUrl();

  courses   : WritableSignal<Course[]> = signal<Course[]>([]);
  categories: WritableSignal<Category[]> = signal<Category[]>([]);
  appName   : string = 'Academ-IQ';
  appSlogan : string = 'Shape Today. Own Tomorrow.';
  scale     : number = 1;
  opacity   : number = 1;
  duplicatedCategories = computed(() => [...this.categories(), ...this.categories(), ...this.categories(), ...this.categories(), ...this.categories()]);
  shuffled = computed(() => [...this.courses()].sort(() => 0.5 - Math.random()).slice(0, 4));

  constructor() {
    this.loadData();
  }

  private loadData() {
    this.courseService.findAll().subscribe({
      next: (response) => { this.courses.set(response); }
    });

    this.courseService.findAllCategories().subscribe({
      next: (response) => { this.categories.set(response); }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;

    // Controlamos más espacio de scroll (por ejemplo, el doble del alto de la pantalla)
    const maxScroll = windowHeight * .5;
    const progress = Math.min(scrollTop / maxScroll, 1); // siempre entre 0 y 1

    this.scale = 1 + progress * .4;  // Se agranda hasta 2.5x
    this.opacity = 1 - progress;      // 1 -> 0 de forma perfecta
  }

}
