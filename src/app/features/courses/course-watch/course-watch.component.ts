import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CourseService } from '../../../core/services/course/course.service';
import { FileRes } from '../../../core/models/course.models';
import { CourseAccordionComponent } from '../course-accordion/course-accordion.component';
import { Course } from '../../../core/models/course.models';
import { EnrollmentService } from '../../../core/services/user-course/enrollment.service';
import { Enrollment } from '../../../core/models/user-course.models';
import { CoursePlayerComponent } from '../course-player/course-player.component';
import { ToastService } from '../../../core/services/toast.service';

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
  private readonly courseService: CourseService = inject(CourseService);
  private readonly enrollmentService: EnrollmentService = inject(EnrollmentService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly toast: ToastService = inject(ToastService);

  sectionId: WritableSignal<number> = signal<number>(0);
  lessonId: WritableSignal<number> = signal<number>(0);
  file: WritableSignal<FileRes | null> = signal<FileRes>({} as FileRes);

  course: Course = {} as Course;
  enrollment: Enrollment | null = null;
  lessonsCompleted: number = 0;
  lessonsTotal: number = 0;
  activeTab: string = 'description';
  loading: boolean = false;
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
            this.isCourseCompleted = response.isCompleted;
            this.lessonsCompleted = response.progressState?.completedLessons?.length || 0;
            this.lessonsTotal = this.course.sections.reduce(
              (sum, section) => sum + section.lessons.length, 0
            );
            this.determineInitialLesson();
/*             this.checkCourseCompletion();
 */          }
        });
      }
    });
  }

  private determineInitialLesson() {
    if (this.enrollment?.progressState?.currentSectionId && this.enrollment?.progressState?.currentLessonId) {
      this.loadLesson(
        this.enrollment.progressState.currentSectionId,
        this.enrollment.progressState.currentLessonId
      );
      return;
    }

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

    this.markCurrentLessonAsCompleted();


    const nextLesson = this.findNextLesson();
    if (!nextLesson) {
      this.markCourseAsCompleted();
      return;
    }

    this.loadLesson(nextLesson.sectionId, nextLesson.lessonId);

    this.updateProgress(nextLesson.sectionId, nextLesson.lessonId);
  }

  private markCourseAsCompleted(): void {
    if (!this.enrollment) return;

    this.enrollmentService.update(this.course.id, { isCompleted: true })
      .subscribe({
        next: (response) => {
          this.enrollment = response;
          this.isCourseCompleted = true;
          this.toast.show('Course completed!', 'success');
        },
        error: (error) => {
          this.toast.show(error.error.message, 'error');
        }
      });
  }

  private markCurrentLessonAsCompleted(): void {
    if (!this.enrollment) return;

    if (!this.enrollment.progressState) {
      this.enrollment.progressState = {
        currentSectionId: this.sectionId(),
        currentLessonId: this.lessonId(),
        completedLessons: []
      };
    }

    this.enrollment.progressState.currentSectionId = this.sectionId();
    this.enrollment.progressState.currentLessonId = this.lessonId();

    const currentSectionId = this.sectionId();
    const currentLessonId = this.lessonId();

    const isAlreadyCompleted = this.enrollment.progressState.completedLessons.some(
      lesson => lesson.sectionId === currentSectionId && lesson.lessonId === currentLessonId
    );

    if (!isAlreadyCompleted) {
      this.enrollment.progressState.completedLessons.push({
        sectionId: currentSectionId,
        lessonId: currentLessonId,
        completedAt: new Date().toISOString()
      });
      this.lessonsCompleted++;
    }
  }

  private findNextLesson(): { sectionId: number, lessonId: number } | null {
    const currentSectionIndex = this.course.sections.findIndex(s => s.id === this.sectionId());
    const currentSection = this.course.sections[currentSectionIndex];
    const currentLessonIndex = currentSection?.lessons.findIndex(l => l.id === this.lessonId()) ?? -1;

    if (currentLessonIndex >= 0 && currentLessonIndex < currentSection.lessons.length - 1) {
      return {
        sectionId: currentSection.id,
        lessonId: currentSection.lessons[currentLessonIndex + 1].id
      };
    }

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
    this.loading = true;
    if (!this.enrollment) return;

    this.enrollmentService.updateProgress(this.course.id, sectionId, lessonId, true) // Marcar como completada
      .subscribe({
        next: (response) => {
          this.enrollment = response;
          /* this.checkCourseCompletion(); */
        },
        error: (error) => {
          this.toast.show(error.error.message, 'error');
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  /* private checkCourseCompletion(): void {
    if (!this.enrollment || !this.course) return;

    const totalLessons = this.course.sections.reduce(
      (sum, section) => sum + section.lessons.length, 0
    );

    this.isCourseCompleted = this.enrollment.progressState?.completedLessons?.length >= totalLessons;
  } */

  onLessonSelected(lessonPath: string): void {
    const [sectionIdStr, lessonIdStr] = lessonPath.split(':');
    const sectionId = Number(sectionIdStr);
    const lessonId = Number(lessonIdStr);

    if (isNaN(sectionId) || isNaN(lessonId)) return;

    this.loadLesson(sectionId, lessonId);

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
