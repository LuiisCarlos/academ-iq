import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CourseAccordionComponent } from '../course-accordion/course-accordion.component';
import { CourseService } from '../../../core/services/course.service';
import { Course, Lesson } from '../../../core/models/course.models';
import { File } from '../../../core/models/course.models';

@Component({
  selector    : 'app-course-player',
  templateUrl : './course-player.component.html',
  styleUrls   : ['./course-player.component.css'],
  imports     : [
    RouterLink,
    FormsModule,
    CommonModule,
    CourseAccordionComponent
  ]
})
export class CoursePlayerComponent {
  private readonly courseService : CourseService = inject(CourseService);
  private readonly route         : ActivatedRoute = inject(ActivatedRoute);

  private router: Router = inject(Router);

  // [FUNCIONALIDAD] Estado del componente
  course    : WritableSignal<Course> = signal<Course>({} as Course);
  sectionId : WritableSignal<number> = signal<number>(0);
  lessonId  : WritableSignal<number> = signal<number>(0);
  file      : WritableSignal<File | null>   = signal<File>({} as File);
  activeTab: string = 'description';
  tabs = [
    { id: 'description', label: 'Description' },
    { id: 'resources',   label: 'Resources'   }
  ];

  constructor() {
    const courseId: number = Number(this.route.snapshot.paramMap.get('id'));
    this.route.queryParamMap.subscribe((params) => {
      this.sectionId.set(Number(params.get('section')));
      this.lessonId.set(Number(params.get('lesson')));

      const section = this.course().sections.find(s => s.id === this.sectionId());
      const lesson = section?.lessons.find(l => l.id === this.lessonId());

      console.log(lesson);
      console.log(lesson?.file);

      this.file.set(lesson?.file ?? null);
    });

    this.loadCourse(courseId);
  }

  // [FUNCIONALIDAD] Cargar datos del curso
  loadCourse(courseId: number) {
    this.courseService.findById(courseId).subscribe({
      next: (response) => {
        this.course.set(response);
      }
    })
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  // [FUNCIONALIDAD] Seleccionar lección
  selectLesson(lesson: Lesson) {
    /*if (!this.hasAccess && !lesson.isPreview) return;

    this.currentLessonId.set(lesson.id);
    this.currentLesson.set(lesson);*/
    // [FUNCIONALIDAD] Aquí iría la lógica para cargar el video
  }

  // [FUNCIONALIDAD] Reproducir video
  playVideo() {
    console.log('Iniciar reproducción del video');
  }

  // [FUNCIONALIDAD] Verificar lección completada
  isLessonCompleted(lessonId: string): boolean {
    // Lógica para verificar progreso del usuario
    return false;
  }

  // [FUNCIONALIDAD] Contar lecciones completadas
  /*get completedLessons(): number {
    return this.course()?.lessons.filter(l => this.isLessonCompleted(l.id)).length || 0;
  }*/

}