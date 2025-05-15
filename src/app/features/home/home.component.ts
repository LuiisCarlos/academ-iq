import { Component, computed, HostListener, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CourseService } from '../../core/services/course/course.service';
import { Category, Course } from '../../core/models/course.models';
import { ConfigService } from '../../core/services/config/config.service';

@Component({
  selector    : 'app-home',
  templateUrl : './home.component.html',
  styleUrl    : './home.component.css',
  imports     : [
    RouterLink,
    CommonModule
  ]
})
export class HomeComponent {
  private readonly course : CourseService = inject(CourseService);
  private readonly config : ConfigService = inject(ConfigService);

  protected readonly apiUrl: string = this.config.getApiUrl();

  courses   : WritableSignal<Course[]> = signal<Course[]>([]);
  categories: WritableSignal<Category[]> = signal<Category[]>([]);
  appName   : string = 'Academ-IQ';
  appSlogan : string = 'Shape Today. Own Tomorrow.';
  scale     : number = 1;
  opacity   : number = 1;
  duplicatedCategories = computed(() => [...this.categories(), ...this.categories(), ...this.categories(), ...this.categories(), ...this.categories()]);
  shuffled = computed(() => [...this.courses()].sort(() => 0.5 - Math.random()).slice(0, 4));
  activeTab = 'certification'; // Tab por defecto
  certificationProgress = 75; // Ejemplo de progreso
  userScore = 850; // Ejemplo de puntuación

  tabs = [
    {
      id: 'certification',
      imageUrl: 'https://res.cloudinary.com/duu4u98gb/image/upload/v1747091207/academiq-certificates_rdjai9.png',
      title: 'Certificación Profesional',
      description: 'Obtén certificados reconocidos al completar cursos',
      longDescription: 'Nuestras certificaciones están validadas por la industria y demuestran tu dominio en cada área. Completa todos los módulos y exámenes para obtener tu certificado digital que podrás compartir en LinkedIn y otras redes profesionales.',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
    },
/*     {
      id: 'scoring',
      title: 'Sistema de Puntuación',
      description: 'Gana puntos por cada curso completado',
      longDescription: 'Nuestro sistema de puntuación reconoce tu esfuerzo y dedicación. Obtén puntos por completar cursos, con bonificaciones por dificultad y excelencia. Los puntos determinan tu nivel de experiencia en la plataforma y pueden desbloquear beneficios exclusivos.',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
    },
    {
      id: 'achievements',
      title: 'Logros y Reconocimientos',
      description: 'Desbloquea insignias por tus logros',
      longDescription: 'Celebramos tus hitos de aprendizaje con insignias y reconocimientos especiales. Completa secuencias de cursos, mantén rachas de aprendizaje o domina habilidades específicas para ganar estas distinciones visibles en tu perfil.',
      icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
    },
    {
      id: 'community',
      title: 'Comunidad de Aprendizaje',
      description: 'Conecta con otros profesionales',
      longDescription: 'Únete a grupos de estudio, participa en discusiones y resuelve dudas con nuestra comunidad activa de profesionales. Colabora en proyectos, comparte recursos y expande tu red de contactos mientras aprendes.',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    } */
  ];


  constructor() {
    this.loadData();
  }

  private loadData() {
    this.course.findAll().subscribe({
      next: (response) => { this.courses.set(response); }
    });

    this.course.findAllCategories().subscribe({
      next: (response) => { this.categories.set(response); }
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;

    // Controlamos más espacio de scroll (por ejemplo, el doble del alto de la pantalla)
    const maxScroll = windowHeight * .5;
    const progress = Math.min(scrollTop / maxScroll, 1); // siempre entre 0 y 1

    this.scale = 1 + progress * .4;  // Se agranda hasta 2.5x
    this.opacity = 1 - progress;      // 1 -> 0 de forma perfecta
  }

  getRandomGradient(): string {
    const colors = [
      ['#6366F1', '#8B5CF6'], // purple
      ['#3B82F6', '#06B6D4'], // blue/cyan
      ['#10B981', '#34D399'], // green
      ['#EF4444', '#F97316'], // red/orange
      ['#7C3AED', '#A855F7'], // indigo/purple
      ['#F59E0B', '#FBBF24'], // yellow/amber
      ['#EC4899', '#F43F5E']  // pink/rose
    ];
    const randomPair = colors[Math.floor(Math.random() * colors.length)];
    return `linear-gradient(135deg, ${randomPair[0]} 0%, ${randomPair[1]} 100%)`;
  }


  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  getActiveTab() {
    return this.tabs.find(tab => tab.id === this.activeTab) || this.tabs[0];
  }

}
