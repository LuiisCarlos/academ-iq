import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CourseService } from '../../../core/services/course/course.service';
import { File } from '../../../core/models/course.models';
import { CourseAccordionComponent } from '../course-accordion/course-accordion.component';
import { Course } from '../../../core/models/course.models';
import { EnrollmentService } from '../../../core/services/user-course/enrollment.service';
import { Enrollment } from '../../../core/models/user-course.models';
import { CoursePlayerComponent } from '../course-player/course-player.component';

@Component({
  selector: 'app-course-watch',
  templateUrl: './course-watch.component.html',
  styleUrl: './course-watch.component.css',
  imports: [
    RouterLink,
    FormsModule,
    CommonModule,
    CoursePlayerComponent,
    CourseAccordionComponent
  ],
  standalone: true
})
export class CourseWatchComponent {
  private readonly courseService = inject(CourseService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly route = inject(ActivatedRoute);

  course: Course = {} as Course;
  enrollment: Enrollment | null = null;
  lessonsCompleted: number = 0;
  lessonsTotal: number = 0;
  sectionId: WritableSignal<number> = signal<number>(0);
  lessonId: WritableSignal<number> = signal<number>(0);
  file: WritableSignal<File | null> = signal<File>({} as File);
  activeTab: string = 'description';
  isCourseCompleted: boolean = false;
  tabs = [
    { id: 'description', label: 'Description' },
    { id: 'resources', label: 'Resources' }
  ];

  constructor() {
    const courseId: number = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData(courseId);
  }

  loadData(courseId: number) {
    this.courseService.findById(courseId).subscribe({
      next: (course) => {
        this.course = course;
        this.enrollmentService.findOrCreate(courseId).subscribe({
          next: (response) => {
            this.enrollment = response;
            this.lessonsCompleted = response.progressState?.completedLessons?.length || 0;
            this.lessonsTotal = this.course.sections.reduce(
              (sum, section) => sum + section.lessons.length, 0
            );
            this.determineInitialLesson();
            this.checkCourseCompletion();
          }
        });
      }
    });
  }

  private determineInitialLesson() {
    // Caso 1: Usar la lección actual del progreso si existe
    if (this.enrollment?.progressState?.currentSectionId && this.enrollment?.progressState?.currentLessonId) {
      this.loadLesson(
        this.enrollment.progressState.currentSectionId,
        this.enrollment.progressState.currentLessonId
      );
      return;
    }

    // Caso 2: Cargar primera lección del curso
    const firstSection = this.course.sections?.[0];
    const firstLesson = firstSection?.lessons?.[0];
    if (firstSection && firstLesson) {
      this.loadLesson(firstSection.id, firstLesson.id);
    }
  }

  private loadLesson(sectionId: number, lessonId: number) {
    this.sectionId.set(sectionId);
    this.lessonId.set(lessonId);

    const section = this.course.sections.find(s => s.id === sectionId);
    const lesson = section?.lessons.find(l => l.id === lessonId);
    this.file.set(lesson?.file ?? null);
  }

  nextLesson(): void {
    if (!this.enrollment || !this.course) return;

    // 1. Marcar la lección actual como completada
    this.markCurrentLessonAsCompleted();

    // 2. Encontrar la siguiente lección
    const nextLesson = this.findNextLesson();
    if (!nextLesson) {
      // No hay más lecciones - curso completado
      this.isCourseCompleted = true;
      return;
    }

    // 3. Cargar la nueva lección
    this.loadLesson(nextLesson.sectionId, nextLesson.lessonId);

    // 4. Actualizar el progreso en el backend
    this.updateProgress(nextLesson.sectionId, nextLesson.lessonId);
  }

  private markCurrentLessonAsCompleted(): void {
    if (!this.enrollment?.progressState) {
      this.enrollment!.progressState = {
        currentSectionId: this.sectionId(),
        currentLessonId: this.lessonId(),
        completedLessons: []
      };
    }

    // Actualizar lección actual
    this.enrollment!.progressState.currentSectionId = this.sectionId();
    this.enrollment!.progressState.currentLessonId = this.lessonId();

    // Añadir a completadas si no existe
    const lessonKey = `${this.sectionId()}:${this.lessonId()}`;
    const alreadyCompleted = this.enrollment!.progressState.completedLessons.some(
      cl => cl.sectionId === this.sectionId() && cl.lessonId === this.lessonId()
    );

    if (!alreadyCompleted) {
      this.enrollment!.progressState.completedLessons.push({
        sectionId: this.sectionId(),
        lessonId: this.lessonId(),
        completedAt: new Date().toISOString()
      });
      this.lessonsCompleted++;
    }
  }

  private findNextLesson(): { sectionId: number, lessonId: number } | null {
    const currentSectionIndex = this.course.sections.findIndex(s => s.id === this.sectionId());
    const currentSection = this.course.sections[currentSectionIndex];
    const currentLessonIndex = currentSection?.lessons.findIndex(l => l.id === this.lessonId()) ?? -1;

    // Buscar siguiente lección en la misma sección
    if (currentLessonIndex >= 0 && currentLessonIndex < currentSection.lessons.length - 1) {
      return {
        sectionId: currentSection.id,
        lessonId: currentSection.lessons[currentLessonIndex + 1].id
      };
    }

    // Buscar primera lección de la siguiente sección
    if (currentSectionIndex < this.course.sections.length - 1) {
      const nextSection = this.course.sections[currentSectionIndex + 1];
      if (nextSection.lessons.length > 0) {
        return {
          sectionId: nextSection.id,
          lessonId: nextSection.lessons[0].id
        };
      }
    }

    return null;
  }

  private updateProgress(sectionId: number, lessonId: number): void {
    if (!this.enrollment) return;

    this.enrollmentService.updateProgress(
      this.course.id,
      sectionId,
      lessonId,
      true // Marcar como completada
    ).subscribe({
      next: (updatedEnrollment) => {
        this.enrollment = updatedEnrollment;
        this.checkCourseCompletion();
      },
      error: (error) => {
        console.error('Error updating progress:', error);
      }
    });
  }

  private checkCourseCompletion(): void {
    if (!this.enrollment || !this.course) return;

    const totalLessons = this.course.sections.reduce(
      (sum, section) => sum + section.lessons.length, 0
    );

    this.isCourseCompleted = this.enrollment.progressState?.completedLessons?.length >= totalLessons;
  }

  onLessonSelected(lessonPath: string): void {
    const [sectionIdStr, lessonIdStr] = lessonPath.split(':');
    const sectionId = Number(sectionIdStr);
    const lessonId = Number(lessonIdStr);

    if (isNaN(sectionId) || isNaN(lessonId)) return;

    // Cargar la lección seleccionada
    this.loadLesson(sectionId, lessonId);

    // Actualizar progreso (solo como vista, no como completada)
    if (this.enrollment?.progressState) {
      this.enrollment.progressState.currentSectionId = sectionId;
      this.enrollment.progressState.currentLessonId = lessonId;

      this.enrollmentService.updateProgress(
        this.course.id,
        sectionId,
        lessonId,
        false // No marcar como completada
      ).subscribe({
        next: (updatedEnrollment) => {
          this.enrollment = updatedEnrollment;
        }
      });
    }
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

}
