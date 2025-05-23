export interface UserRegisterDto {
    username        : string,
    password        : string,
    confirmPassword : string
    email           : string,
    firstname       : string,
    lastname        : string,
    phone?          : string,
    birthdate       : string
}

export interface LoginResponseDto {
    accessToken  : string,
    refreshToken : string,
    user         : UserDetails
}

export interface UserDetails {
    username?       : string,
    avatarUrl?      : string,
    email?          : string,
    firstname?      : string,
    lastname?       : string,
    birthdate?      : string
    phone?          : string,
    dni?            : string,
    githubUrl?      : string,
    linkedinUrl?    : string,
    websiteUrl?     : string,
    biography?      : string,
    studies?        : string,
    jobArea?        : string,
    workExperience? : string,
    companyName?    : string,
    isTeamManager?  : boolean,
    wantToUpgrade?  : boolean,
    registeredAt?   : string,
    hours?          : number
}
