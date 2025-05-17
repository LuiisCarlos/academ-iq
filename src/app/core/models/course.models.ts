import { RatingRes } from "./user-course.models";

export interface Course {
    id            : number,
    title         : string ,
    subtitle      : string,
    description   : string,
    author        : string,
    thumbnailUrl  : string,
    category      : Category,
    level         : string,
    averageRating : number,
    ratings       : RatingRes[],
    duration      : string,
    createdAt     : string
    requirements  : string[],
    sections      : Section[]
}

export interface Section {
    id       : number,
    name     : string,
    duration : string,
    lessons  : Lesson[]
}

export interface Lesson {
    id   : number,
    name : string,
    file : File
}

export interface File {
    filename    : string,
    contentType : string,
    size        : number,
    url         : string,
}

export interface Category {
    id               : number,
    name             : string,
    svg              : string,
    color            : string,
    shortDescription : string,
    longDescription  : string,
    benefits         : Benefit[]
}

export interface Benefit {
    id       : number,
    title    : string,
    subtitle : string,
    svg      : string,
}
