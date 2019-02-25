import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  error: Error;
  returnUrl: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  tryRegister(email: string, password: string) {
    this.authService.doRegister({ email, password })
      .then(() => this.tryLogin(email, password))
      .catch((err) => (this.error = err));
  }

  tryLogin(email: string, password: string) {
    this.authService.doLogin({ email, password })
      .then(() => this.router.navigateByUrl(this.returnUrl))
      .catch((err) => (this.error = err));
  }

  tryLoginWithGoogle() {
    this.authService.doLoginWithGoogle()
      .then(() => this.router.navigateByUrl(this.returnUrl))
      .catch((err) => (this.error = err));
  }

  tryLoginAsGuest() {
    this.authService.doLoginAsGuest()
      .then(() => this.router.navigateByUrl(this.returnUrl))
      .catch((err) => (this.error = err));
  }
}
