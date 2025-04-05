import { Routes } from '@angular/router';
import { PageNotFoundComponent } from '../layouts/page-not-found/page-not-found.component';
import { HomeComponent } from '../features/home/home.component';

export const routes: Routes = [
    {
        path: '/home',
        component: HomeComponent
    },

    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: '**',
        component: PageNotFoundComponent
    }
];
