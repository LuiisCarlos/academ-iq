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
  isCourseCompleted: boolean = false;
  tabs = [
    { id: 'description', label: 'Description' },
    { id: 'resources',   label: 'Resources'   }
  ];

  constructor() {
    const courseId: number = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData(courseId);
  }

  loadData(courseId: number) {
    this.courseService.findById(courseId).subscribe({
      next: (responseC) => {
        this.course = responseC;
        this.enrollmentService.findById(this.course.id).subscribe({
          next: (responseE) => {
            this.enrollment = responseE;
            console.log(responseE);
            this.lessonsCompleted = this.enrollment?.progressState.sections
              .flatMap(s => s.lessons)
              .filter(l => l.completed)!.length || 0;

            // Determine which lesson to load
            this.determineInitialLesson();

            // 2. Verificar completado (solo si no está marcado)
            if (!this.enrollment.isCompleted) {
              this.checkCourseCompletion();
            } else {
              this.isCourseCompleted = true;
            }
          }
        });
      }
    });
  }

  // Determine which lesson to load initially
  private determineInitialLesson() {
    // Case 1: Check user progress for current lesson
    if (this.enrollment?.progressState.currentSectionId && this.enrollment?.progressState.currentLessonId) {
      const sectionId = this.enrollment.progressState.currentSectionId;
      const lessonId = this.enrollment.progressState.currentLessonId;
      this.loadLesson(sectionId, lessonId);
      return;
    }

    // Case 2: Load first lesson of first section
    if (this.course.sections?.length > 0 && this.course.sections[0].lessons?.length > 0) {
      const sectionId = this.course.sections[0].id;
      const lessonId = this.course.sections[0].lessons[0].id;
      this.loadLesson(sectionId, lessonId);
    }
  }

  // Load a specific lesson by section and lesson ID
  private loadLesson(sectionId: number, lessonId: number) {
    this.sectionId.set(sectionId);
    this.lessonId.set(lessonId);

    const section = this.course?.sections.find(s => s.id === sectionId);
    const lesson = section?.lessons.find(l => l.id === lessonId);
    this.file.set(lesson?.file ?? null);
  }

  nextLesson(): void {
    if (!this.enrollment || !this.course) return;

    // 1. Marcar la lección actual como completada
    this.markCurrentLessonAsCompleted();

    // 2. Encontrar la siguiente lección
    const nextLesson = this.findNextLesson();
    if (!nextLesson) return;

    // 3. Asegurarse de que la sección exista en el progreso (LOCALMENTE)
    this.ensureSectionExists(nextLesson.sectionId, nextLesson.lessonId);

    // 4. Cargar la nueva lección (visualmente)
    this.loadLesson(nextLesson.sectionId, nextLesson.lessonId);

    // 5. Actualizar el progreso en el backend (con la nueva sección incluida)
    this.updateProgress(nextLesson.sectionId, nextLesson.lessonId, () => {
      // 6. Verificar si el curso está completado (SOLO después de actualizar el backend)
      this.checkCourseCompletion();
    });
  }
  private markCurrentLessonAsCompleted(): void {
    const currentSectionId = this.sectionId();
    const currentLessonId = this.lessonId();

    // Actualizar el estado local
    this.enrollment!.progressState.currentSectionId = currentSectionId;
    this.enrollment!.progressState.currentLessonId = currentLessonId;

    // Buscar y actualizar la lección en el progreso
    const section = this.enrollment!.progressState.sections.find(s => s.sectionId === currentSectionId);
    if (section) {
      const lesson = section.lessons.find(l => l.lessonId === currentLessonId);
      if (lesson) {
        lesson.completed = true;
        lesson.lastAccessed = this.datetimeFormated();
        lesson.videoProgress = 100.0;
      } else {
        // Si no existe en el progreso, añadirlo
        section.lessons.push({
          lessonId: currentLessonId,
          completed: true,
          lastAccessed: this.datetimeFormated(),
          videoProgress: 100.0
        });
      }

      // Verificar si toda la sección está completada
      section.completed = section.lessons.every(l => l.completed);
    } else {
      // Si no existe la sección en el progreso, añadirla
      this.enrollment!.progressState.sections.push({
        sectionId: currentSectionId,
        completed: false,
        lessons: [{
          lessonId: currentLessonId,
          completed: true,
          lastAccessed: this.datetimeFormated(),
          videoProgress: 100.0
        }]
      });
    }
  }


  private checkCourseCompletion(): void {
    if (!this.enrollment || !this.course) return;

    // Verificar que todas las secciones del curso estén representadas en el progreso
    const allSectionsRepresented = this.course.sections.every(courseSection =>
      this.enrollment!.progressState.sections.some(s => s.sectionId === courseSection.id)
    );

    if (!allSectionsRepresented) {
      this.isCourseCompleted = false;
      return;
    }

    // Solo verificar completado si todas las secciones están en el progreso
    const allSectionsCompleted = this.enrollment.progressState.sections.every(s => s.completed);

    if (allSectionsCompleted && !this.enrollment.isCompleted) {
      this.isCourseCompleted = true;
    }
  }

  setCourseCompleted() {
    this.enrollmentService.patchCompleted(this.course.id).subscribe({
      next: (response) => {
        this.enrollment = response;
      },
      error: (error: string) => {
        console.error('Error marking course as completed:', error);
      }
    });
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

    // No hay más lecciones (esto se manejará después según lo indicado)
    return null;
  }


  private updateProgress(sectionId: number, lessonId: number, callback?: () => void): void {
    // Actualizar el estado local primero
    this.enrollment!.progressState.currentSectionId = sectionId;
    this.enrollment!.progressState.currentLessonId = lessonId;

    this.enrollmentService.patchProgressState(
      this.course.id,
      this.enrollment?.progressState!
    ).subscribe({
      next: (response) => {
        this.enrollment = response;
        this.lessonsCompleted = this.enrollment!.progressState.sections
          .flatMap(s => s.lessons)
          .filter(l => l.completed)!.length;

        // Ejecutar el callback después de la actualización
        if (callback) callback();
      },
      error: (error) => {
        console.error('Error updating progress:', error);
      }
    });
  }

  onLessonSelected(lessonPath: string): void {
    if (!lessonPath || !this.course) return;

    // Parsear el string "seccionId:leccionId"
    const [sectionIdStr, lessonIdStr] = lessonPath.split(':');
    const sectionId = Number(sectionIdStr);
    const lessonId = Number(lessonIdStr);

    if (isNaN(sectionId) || isNaN(lessonId)) {
      console.error('Invalid lesson path format');
      return;
    }

    // Verificar que la sección y lección existen en el curso
    const sectionExists = this.course.sections.some(s => s.id === sectionId);
    const lessonExists = this.course.sections
      .flatMap(s => s.lessons)
      .some(l => l.id === lessonId);

    if (!sectionExists || !lessonExists) {
      console.error('Section or Lesson not found in course');
      return;
    }

    // Actualizar el progreso para marcar como última lección accedida
    this.updateCurrentProgress(sectionId, lessonId);

    // Cargar la lección seleccionada
    this.loadLesson(sectionId, lessonId);
  }

  private updateCurrentProgress(sectionId: number, lessonId: number): void {
    if (!this.enrollment) return;

    // Actualizar el estado local
    this.enrollment.progressState.currentSectionId = sectionId;
    this.enrollment.progressState.currentLessonId = lessonId;

    // Buscar la sección en el progreso
    let sectionProgress = this.enrollment.progressState.sections.find(s => s.sectionId === sectionId);

    if (!sectionProgress) {
      // Si no existe, crear una nueva entrada
      sectionProgress = {
        sectionId: sectionId,
        completed: false,
        lessons: []
      };
      this.enrollment.progressState.sections.push(sectionProgress);
    }

    // Buscar la lección en el progreso
    const lessonProgress = sectionProgress.lessons.find(l => l.lessonId === lessonId);

    if (!lessonProgress) {
      // Si no existe, crear una nueva entrada
      sectionProgress.lessons.push({
        lessonId: lessonId,
        completed: false,
        lastAccessed: this.datetimeFormated(),
        videoProgress: 0.0
      });
    } else {
      // Si existe, actualizar la fecha de último acceso
      lessonProgress.lastAccessed = this.datetimeFormated();
    }
    console.log(this.enrollment?.progressState);
    // Enviar la actualización al backend
    this.enrollmentService.patchProgressState(this.course.id, this.enrollment?.progressState)
      .subscribe({
        next: (response) => {
          this.enrollment = response;
        },
        error: (error) => {
          console.error('Error updating progress:', error);
        }
      });

  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  datetimeFormated(): string {
    const date = new Date();

    // Obtener día y mes con 2 dígitos
    const day = date.getDate().toString().padStart(2, '0'); // padStart asegura que el día siempre tenga 2 dígitos
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth devuelve el mes entre 0-11, por lo que sumamos 1

    // Formatear la hora con 2 dígitos
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    const dateFormated =`${day}/${month}/${date.getFullYear()} ${hours}:${minutes}:${seconds}`
    console.log(dateFormated);
    return dateFormated;
  }

  private ensureSectionExists(sectionId: number, lessonId: number): void {
    if (!this.enrollment) return;

    // Verificar si la sección ya existe en el progreso
    const sectionExists = this.enrollment.progressState.sections.some(s => s.sectionId === sectionId);

    if (!sectionExists) {
      // Crear la nueva sección con la lección inicial (no completada)
      this.enrollment.progressState.sections.push({
        sectionId: sectionId,
        completed: false,
        lessons: [{
          lessonId: lessonId,
          completed: false,
          lastAccessed: this.datetimeFormated(),
          videoProgress: 0.0
        }]
      });
    } else {
      // Si la sección existe, asegurarse de que la lección exista
      const section = this.enrollment.progressState.sections.find(s => s.sectionId === sectionId);
      if (section) {
        const lessonExists = section.lessons.some(l => l.lessonId === lessonId);
        if (!lessonExists) {
          section.lessons.push({
            lessonId: lessonId,
            completed: false,
            lastAccessed: this.datetimeFormated(),
            videoProgress: 0.0
          });
        }
      }
    }
  }

}