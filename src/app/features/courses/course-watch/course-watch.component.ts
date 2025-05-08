import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CourseService } from '../../../core/services/course/course.service';
import { File } from '../../../core/models/course.models';
import { CourseAccordionComponent } from '../course-accordion/course-accordion.component';
import { Course, Lesson } from '../../../core/models/course.models';
import { EnrollmentService } from '../../../core/services/course/enrollment.service';
import { Enrollment } from '../../../core/models/user.models';
import { CoursePlayerComponent } from '../course-player/course-player.component';

@Component({
  selector    : 'app-course-watch',
  templateUrl : './course-watch.component.html',
  styleUrl    : './course-watch.component.css',
  imports     : [
    RouterLink,
    FormsModule,
    CommonModule,
    CoursePlayerComponent,
    CourseAccordionComponent
  ]
})
export class CourseWatchComponent {
  private readonly courseService     : CourseService     = inject(CourseService);
  private readonly enrollmentService : EnrollmentService = inject(EnrollmentService);
  private readonly route             : ActivatedRoute    = inject(ActivatedRoute);

  course     : Course            = {} as Course;
  enrollment : Enrollment | null = null;
  lessonsCompleted : number = 0;
  sectionId  : WritableSignal<number> = signal<number>(0);
  lessonId   : WritableSignal<number> = signal<number>(0);
  file       : WritableSignal<File | null> = signal<File>({} as File);
  activeTab  : string = 'description';
  tabs = [
    { id: 'description', label: 'Description' },
    { id: 'resources',   label: 'Resources'   }
  ];

  constructor() {
    const courseId: number = Number(this.route.snapshot.paramMap.get('id'));
    this.route.queryParamMap.subscribe((params) => {
      this.sectionId.set(Number(params.get('section')));
      this.lessonId.set(Number(params.get('lesson')));

      const section = this.course?.sections.find(s => s.id === this.sectionId());
      const lesson = section?.lessons.find(l => l.id === this.lessonId());

      console.log(lesson + 'aa');
      //console.log(lesson?.file);

      this.file.set(lesson?.file ?? null);
    });

    this.loadData(courseId);
  }

  // [FUNCIONALIDAD] Cargar datos del curso
  loadData(courseId: number) {
    this.courseService.findById(courseId).subscribe({
      next: (response) => {
        this.course = response;
        this.enrollmentService.findById(this.course.id).subscribe({
          next: (response) => {
            this.enrollment = response;
            this.lessonsCompleted = this.enrollment?.progressState.sections
              .flatMap(s => s.lessons)
              .filter(l => l.completed)!.length;
          }
        })
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

  // [FUNCIONALIDAD] Verificar lección completada
  isLessonCompleted(lessonId: string): boolean {
    // Lógica para verificar progreso del usuario
    return false;
  }

}