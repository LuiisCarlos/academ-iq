import { Routes } from '@angular/router';

import { EditProfileComponent } from './features/user/edit-profile/edit-profile.component';
import { CourseListComponent } from './features/courses/course-list/course-list.component';
import { DashboardComponent } from './features/user/dashboard/dashboard.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { LoginComponent } from './features/auth/login/login.component';
import { PageNotFoundComponent } from './layouts/page-not-found/page-not-found.component';
import { HomeComponent } from './features/home/home.component';
import { ProfileComponent } from './features/user/profile/profile.component';
import { CategoryDetailComponent } from './features/categories/category-detail/category-detail.component';
import { AboutComponent } from './layouts/about/about.component';
import { CourseDetailComponent } from './features/courses/course-detail/course-detail.component';
import { HelpComponent } from './layouts/help/help.component';
import { authGuard } from './core/guards/auth.guard';
import { CourseWatchComponent } from './features/courses/course-watch/course-watch.component';
import { VerifyComponent } from './features/auth/verify/verify.component';
import { CategoriesComponent } from './features/categories/categories/categories.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'catalog', component: CourseListComponent },
    { path: 'about', component: AboutComponent },
    { path: 'help', component: HelpComponent },
    {
        path: 'categories',
        children: [
            { path: '', component: CategoriesComponent },
            { path: ':category', component: CategoryDetailComponent },
        ]
    },
    {
        path: 'auth',
        children: [
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'forgot-password', component: ForgotPasswordComponent },
            { path: 'verify', component: VerifyComponent },
            { path: 'reset-password', component: ResetPasswordComponent }
        ]
    },
    {
        path: 'users',
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'profile/edit', component: EditProfileComponent } // TODO: Fix this
        ],

    },
    {
        path: 'courses',
        children: [
            { path: ':id', component: CourseDetailComponent, canActivate: [authGuard], },
            { path: 'watch/:id', component: CourseWatchComponent, canActivate: [authGuard], }
        ]
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
    {
        path: '**',
        component: PageNotFoundComponent,
    }
];
