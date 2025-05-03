import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { LayoutService } from './core/services/config/layout.service';

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
  private readonly layoutService: LayoutService = inject(LayoutService);

  title = 'Academ-IQ';
  showLayout = true;

  constructor() {
    this.layoutService.showLayout$.subscribe((visible) => {
      this.showLayout = visible;
    });
  }

}
