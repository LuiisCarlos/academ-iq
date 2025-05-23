# Academ-IQ

Academ-IQ is a modern web platform for learning programming and other tech skills through interactive courses.

## Features

- User registration and authentication
- Course catalog with categories and difficulty levels
- Video lesson playback and progress tracking
- Comment and rating system for each course
- User profile editing with avatar upload
- Admin dashboard (in development)
- Fully responsive UI with Angular Material and TailwindCSS

## Technologies Used

- Angular 19+
- Angular Material
- RxJS
- TailwindCSS
- Tailwind Animated
- TypeScript

## Getting Started

1. Clone the repository:
```sh
   git clone https://github.com/LuiisCarlos/academ-iq.git
   cd academ-iq
```
2. Install dependencies:
```sh
    npm install
```
3. Run the app in development mode:
```sh
    ng serve --host 0.0.0.0 --port 4200
```
4. Build for production:
```sh
    ng build --configuration production
```

## Estructura del proyecto
- `src/app/features`: Feature modules (auth, courses, user, etc.)
- `src/app/layouts`: Layout components (navbar, footer, etc.)
- `src/app/shared`: Shared components and pipes
- `src/app/core`: Core services, models, and utilities

## Configuración del entorno
To set API URLs and other environment-specific variables, edit the files inside `src/app/env/`.

## Licencia
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

---
Develop by [LuiisCarlos](https://github.com/LuiisCarlos)