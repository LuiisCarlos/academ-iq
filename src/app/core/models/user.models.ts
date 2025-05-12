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
    currentSectionId: number,
    currentLessonId: number
    sections: SectionState[]
}

export interface Course {
    id           : number,
    title        : string,
    author       : string,
    thumbnailUrl : string,
    category     : Category,
    duration     : string
}

export interface SectionState {
    sectionId: number;
    completed: boolean;
    lessons: LessonState[];
}

export interface LessonState {
    lessonId: number;
    completed: boolean;
    lastAccessed: string | null;
    videoProgress: number;
}

// Para actualizar progreso

export interface LessonProgressUpdate {
    sectionId: number;
    lessonId: number;
    completed: boolean;
    videoProgress: number;
}

export interface CourseProgress {
currentSectionId: number | null;
currentLessonId: number | null;
sections: SectionState[];
}