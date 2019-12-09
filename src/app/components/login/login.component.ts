import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  error: Error;
  returnUrl: string;

  loginForm = new FormGroup({
    emailFormControl: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
    passwordFormControl: new FormControl('', [
      Validators.required
    ])
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  async login() {
    if (!this.loginForm.valid) {
      return;
    }
    try {
      const { emailFormControl, passwordFormControl } = this.loginForm.value;
      await this.authService.login({ email: emailFormControl, password: passwordFormControl });
      this.router.navigateByUrl(this.returnUrl);
    } catch (error) {
      this.error = error;
    }
  }

  async loginWithGoogle(event: Event) {
    event.preventDefault();
    try {
      await this.authService.loginWithGoogle();
      this.router.navigateByUrl(this.returnUrl);
    } catch (error) {
      this.error = error;
    }
  }

  async loginAsGuest(event: Event) {
    event.preventDefault();
    try {
      this.loginForm.reset();
      await this.authService.loginAsGuest();
      this.router.navigateByUrl(this.returnUrl);
    } catch (error) {
      this.error = error;
    }
  }

  goToRegister() {
    this.router.navigateByUrl('/register');
  }

  goToResetPassword() {
    this.router.navigateByUrl('/resetpassword');
  }

}
