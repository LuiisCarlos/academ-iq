import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { LayoutService } from './core/services/config/layout.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    RouterModule,
    NavbarComponent,
    FooterComponent,
    ToastComponent
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
