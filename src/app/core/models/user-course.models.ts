export interface RatingRes {
    rating        : number,
    comment       : string,
    user          : string,
    ratedAt       : string,
    userAvatarUrl : string
}

export interface RatingReq {
    rating  : number,
    comment : string,
}

export interface Enrollment {
    course        : Course,
    progress      : number,
    progressState : ProgressState,
    isFavorite    : boolean,
    isArchived    : boolean,
    isCompleted   : boolean,
    enrolledAt    : string,
    completedAt   : string,
}

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

// Enrollment course response DTO
export interface Course {
    id           : number,
    title        : string,
    author       : string,
    thumbnailUrl : string,
    category     : string,
    categorySvg  : string,
    duration     : string
}