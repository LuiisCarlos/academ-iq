import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, effect, ElementRef, inject, signal, Signal, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { passwordsMatchValidator } from '../../../shared/validators/match-password.validator';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { changePasswordDto } from '../../../core/models/user.models';
import { UserService } from '../../../core/services/user.service';
import { UserDetails } from '../../../core/models/auth.models';
import { Category } from '../../../core/models/course.models';

interface Tab {
  id    : string;
  label : string;
}

@Component({
  selector    : 'app-edit-profile',
  templateUrl : './edit-profile.component.html',
  styleUrl    : './edit-profile.component.css',
  imports     : [
    CommonModule,
    ReactiveFormsModule
  ],
})
export class EditProfileComponent {
  private readonly authService   : AuthService   = inject(AuthService);
  private readonly userService   : UserService   = inject(UserService);
  private readonly courseService : CourseService = inject(CourseService);
  private readonly datePipe      : DatePipe      = inject(DatePipe);
  private readonly formBuilder   : FormBuilder   = inject(FormBuilder);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  avatarPreview: string | ArrayBuffer | null = null;

  user         : Signal<UserDetails | null> = this.authService.user;
  categories   : Category[] | null  = null;
  errorMessage : string             = '';
  loading      : boolean            = false;
  activeTab    : string             = 'profile';
  tabs: Tab[] = [
    { id: 'profile',  label: 'Profile'  },
    { id: 'about',    label: 'About Me' },
    { id: 'security', label: 'Security' }
  ]
  userInfoForm: FormGroup = this.formBuilder.group({
    username  : ['', Validators.required],
    firstname : ['', Validators.required],
    lastname  : ['', Validators.required],
    email     : ['', [Validators.required, Validators.email]],
    dni       : ['', Validators.required],
    birthdate : ['', Validators.required],
  });
  userAboutForm: FormGroup = this.formBuilder.group({
    githubUrl      : [''],
    linkedinUrl    : [''],
    websiteUrl     : [''],
    phone          : [''],
    jobArea        : [''],
    isTeamManager  : [null],
    workExperience : [''],
    studies        : [''],
    companyName    : [''],
    wantToUpgrade  : [null],
    biography      : [''],
  });
  changePasswordForm: FormGroup = this.formBuilder.group({
    currentPassword : ['', Validators.required],
    password        : ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword : ['', [Validators.required, Validators.minLength(6)]],
  }, { validators: passwordsMatchValidator() });

  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (currentUser)
        this.patchFormValues(currentUser);
    });

    if (this.authService.isLoggedIn()) {
      this.loadData();
      if (!this.user())
        this.authService.loadUser().subscribe();
    }
  }

  private loadData() {
    this.courseService.findAllCategories().subscribe({
      next: (response) => {
        this.categories = response;
      },
      error: (error) => {
        console.error('Failed to load categories', error);
      }
    });
  }

  private patchFormValues(user: UserDetails) {
    this.userInfoForm.patchValue({
      username:   user.username,
      firstname:  user.firstname,
      lastname:   user.lastname,
      email:      user.email,
      dni:        user.dni,
      birthdate:  this.datePipe.transform(user.birthdate, 'yyyy-MM-dd')
    });

    this.userAboutForm.patchValue({
      githubUrl:      user.githubUrl,
      linkedinUrl:    user.linkedinUrl,
      websiteUrl:     user.websiteUrl,
      phone:          user.phone,
      jobArea:        user.jobArea,
      isTeamManager:  user.isTeamManager,
      workExperience: user.workExperience,
      studies:        user.studies,
      companyName:    user.companyName,
      wantToUpgrade:  user.wantToUpgrade,
      biography:      user.biography
    });
  }

  private updateUser() {
    const formValue   : any         = this.userInfoForm.value;
    const userDetails : UserDetails = {
      username       : formValue.username       ?? this.user()?.username,
      firstname      : formValue.firstname      ?? this.user()?.firstname,
      lastname       : formValue.lastname       ?? this.user()?.lastname,
      dni            : formValue.dni            ?? this.user()?.dni,
      birthdate      : formValue.birthdate      ?? this.user()?.birthdate,
      githubUrl      : formValue.githubUrl      ?? this.user()?.githubUrl,
      linkedinUrl    : formValue.linkedinUrl    ?? this.user()?.linkedinUrl,
      websiteUrl     : formValue.websiteUrl     ?? this.user()?.websiteUrl,
      phone          : formValue.phone          ?? this.user()?.phone,
      biography      : formValue.biography      ?? this.user()?.biography,
      jobArea        : formValue.jobArea        ?? this.user()?.jobArea,
      isTeamManager  : formValue.isTeamManager  ?? this.user()?.isTeamManager,
      workExperience : formValue.workExperience ?? this.user()?.workExperience,
      studies        : formValue.studies        ?? this.user()?.studies,
      companyName    : formValue.companyName    ?? this.user()?.companyName,
      wantToUpgrade  : formValue.wantToUpgrade  ?? this.user()?.wantToUpgrade,
      email          : this.user()?.email
    }

    this.userService.updateUser(userDetails).subscribe({
      next: () => {
        this.authService.loadUser().subscribe();
      },
      error: (error) => {
        this.errorMessage = error;
        this.loading = false;
      },
      complete: () => {
        this.loading = false
      },
    })
  }

  private changePassword() {
    const formValue = this.userInfoForm.value;
    const passwordDto: changePasswordDto = {
      currentPassword : formValue.currentPassword,
      newPassword     : formValue.password,
      confirmPassword : formValue.confirmPassword
    }

    this.userService.changePassword(passwordDto).subscribe({
      error: (error) => {
        this.errorMessage = error;
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private getActiveForm(): FormGroup {
    switch (this.activeTab) {
      case 'profile' : return this.userInfoForm;
      case 'about'   : return this.userAboutForm;
      case 'security': return this.changePasswordForm;
      default: return this.userInfoForm;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validación básica (tamaño y tipo)
    if (file.size > 2 * 1024 * 1024) { // 2MB
      this.errorMessage = 'Image size should be less than 2MB';
      return;
    }

    if (!file.type.match('image.*')) {
      this.errorMessage = 'Only image files are allowed';
      return;
    }

    this.errorMessage = '';

    // Crear vista previa
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = reader.result;
      // [FUNCIONALIDAD: Aquí podrías llamar a tu servicio para subir el avatar]
      // this.uploadAvatar(file);
    };
    reader.readAsDataURL(file);
  }

  submit() {
    if (this.loading) return;

    this.loading = true;
    this.errorMessage = '';

    const formToSubmit = this.getActiveForm();

    if (formToSubmit.invalid) {
      this.errorMessage = 'Please, fill the required fields';
      this.loading = false;
      return;
    }

    switch (this.activeTab) {
      case 'profile':
        this.updateUser();
        break;
      case 'about':
        this.updateUser();
        break;
      case 'security':
        this.changePassword();
        break;
      default:
        this.loading = false;
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

}
