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
    ratings       : Rating[],
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

export interface Rating {
    rating        : number,
    comment       : string,
    user          : string,
    ratedAt       : string,
    userAvatarUrl : string
}

export interface File {
    filename    : string,
    contentType : string,
    size        : number,
    url         : string,
}

export interface Category {
    id   : number,
    name : string
}
