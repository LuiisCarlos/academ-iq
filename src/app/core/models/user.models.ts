import { Category } from "./course.models"

export interface changePasswordDto {
    currentPassword : string,
    newPassword     : string,
    confirmPassword : string
}

export interface Enrollment {
    course       : Course,
    progress     : number,
    progressState: ProgressState,
    isFavorite   : boolean,
    isArchived   : boolean,
    isCompleted  : boolean,
    enrolledAt   : string,
    completedAt  : string,
}

// Estado del progreSo actual del usuario en Recibido en JSON

export interface ProgressState {
  currentSectionId : number | null;
  currentLessonId  : number | null;
  completedLessons : CompletedLesson[];
}

export interface CompletedLesson {
  sectionId   : number;
  lessonId    : number;
  completedAt : string;
}

export interface Course {
    id           : number,
    title        : string,
    author       : string,
    thumbnailUrl : string,
    category     : Category,
    duration     : string
}
