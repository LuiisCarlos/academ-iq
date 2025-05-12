import {
  Component,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

import { TimeFormatPipe } from '../../../shared/pipes/time-format.pipe';
import { Course } from '../../../core/models/course.models';

@Component({
  selector    : 'app-accordion',
  templateUrl : 'course-accordion.component.html',
  styleUrl    : 'course-accordion.component.css',
  imports     : [
    RouterModule,
    TimeFormatPipe
  ]
})
export class CourseAccordionComponent {
  course       : InputSignal<Course>      = input.required<Course>();
  onPlayer     : InputSignal<boolean>     = input.required<boolean>();
  currentLesson : InputSignal<number | undefined> = input<number | undefined>();
  itemToggled  : OutputEmitterRef<number> = output<number>();
  openSections : WritableSignal<number[]> = signal([0]);
  lessonSelected : OutputEmitterRef<string> = output<string>();

  toggleItem(index: number) {
    this.openSections.update(current => {
      const isOpen = current.includes(index);
      return isOpen
        ? current.filter(i => i !== index) // Si ya está abierto, lo cerramos
        : [...current, index]; // Si no está abierto, lo añadimos
    });
    this.itemToggled.emit(index);
  }

  isSectionOpen(index: number): boolean {
    return this.openSections().includes(index);
  }

  selectLesson(lessonSelect: string) {
    this.lessonSelected.emit(lessonSelect);
  }

}