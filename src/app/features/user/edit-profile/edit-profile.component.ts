import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, effect, ElementRef, inject, Signal, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { passwordsMatchValidator } from '../../../shared/validators/match-password.validator';
import { AuthService } from '../../../core/services/auth/auth.service';
import { CourseService } from '../../../core/services/course/course.service';
import { changePasswordDto } from '../../../core/models/user.models';
import { UserService } from '../../../core/services/user.service';
import { UserDetails } from '../../../core/models/auth.models';
import { Category } from '../../../core/models/course.models';
import { AvatarUploadComponent } from '../../../shared/components/avatar-upload/avatar-upload.component';
import { ToastService } from '../../../core/services/toast.service';

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
    ReactiveFormsModule,
    AvatarUploadComponent
  ],
})
export class EditProfileComponent {
  private readonly authService   : AuthService   = inject(AuthService);
  private readonly userService   : UserService   = inject(UserService);
  private readonly courseService : CourseService = inject(CourseService);
  private readonly datePipe      : DatePipe      = inject(DatePipe);
  private readonly fb            : FormBuilder   = inject(FormBuilder);
  private readonly toast         : ToastService = inject(ToastService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  user         : Signal<UserDetails | null> = this.authService.user;

  avatarPreview: string | ArrayBuffer | null = null;
  categories   : Category[] | null  = null;
  loading      : boolean = false;
  activeTab    : string  = 'profile';
  tabs: Tab[] = [
    { id: 'profile',  label: 'Profile'  },
    { id: 'about',    label: 'About Me' },
    { id: 'security', label: 'Security' }
  ]


  userInfoForm: FormGroup = this.fb.group({
    username  : [''],
    firstname : [''],
    lastname  : [''],
    dni       : [''],
    birthdate : [''],
    email     : [this.user()?.email],
  });

  userAboutForm: FormGroup = this.fb.group({
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

  changePasswordForm: FormGroup = this.fb.group({
    currentPassword : ['', Validators.required],
    password        : ['', Validators.required],
    confirmPassword : ['', Validators.required],
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
    const userFormValue   : any         = this.userInfoForm.value;
    const aboutFormValue  : any         = this.userAboutForm.value;
    const formValue       : any         = { ...userFormValue, ...aboutFormValue };

    const userDetails : UserDetails = {
      username       : this.user()?.username,
      email          : this.user()?.email,
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
      wantToUpgrade  : formValue.wantToUpgrade  ?? this.user()?.wantToUpgrade
    }

    this.userService.updateUser(userDetails).subscribe({
      next: () => {
        this.authService.loadUser().subscribe();
      },
      error: (error) => {
        this.toast.show(error, 'error');
        this.loading = false;
      },
      complete: () => {
        this.loading = false
      },
    })
  }

  private changePassword() {
    const formValue = this.changePasswordForm.value;
    const passwordDto: changePasswordDto = {
      currentPassword : formValue.currentPassword,
      newPassword     : formValue.password,
      confirmPassword : formValue.confirmPassword
    }

    this.userService.changePassword(passwordDto).subscribe({
      next: () => {
        this.toast.show('Password changed successfully', 'success');
      },
      error: (error) => {
        this.toast.show(error.error.message, 'error');
        this.loading = false;
      },
      complete: () => {
        this.authService.logout();
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

  onSubmit() {
    this.loading = true;
    const formToSubmit = this.getActiveForm();

    if (formToSubmit.invalid) {
      formToSubmit.markAllAsTouched();
      this.toast.show('Please fill all required fields', 'error');
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

  deleteAccount() {
    //TODO
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

}
