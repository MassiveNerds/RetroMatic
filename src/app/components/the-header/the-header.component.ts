import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  standalone: false,
  selector: 'app-the-header',
  templateUrl: './the-header.component.html',
  styleUrls: ['./the-header.component.scss'],
})
export class TheHeaderComponent {
  constructor(public authService: AuthService, public themeService: ThemeService) {}

  logout() {
    this.authService.logout();
  }
}
