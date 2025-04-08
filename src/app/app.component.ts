import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    RouterModule,
    NavbarComponent,
    FooterComponent
  ]
})
export class AppComponent {
  title = 'Academ-IQ';
  showNavbar = true;
  showFooter = true;
}
