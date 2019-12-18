import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  error: Error;
  returnUrl: string;

  registerForm = new FormGroup({
    displayNameFormControl: new FormControl('', [Validators.required]),
    emailFormControl: new FormControl('', [Validators.required, Validators.email]),
    passwordFormControl: new FormControl('', [Validators.required]),
  });

  constructor(private router: Router, private authService: AuthService) {}

  async register() {
    if (!this.registerForm.valid) {
      return;
    }
    try {
      const { displayNameFormControl, emailFormControl, passwordFormControl } = this.registerForm.value;
      await this.authService.register({
        displayName: displayNameFormControl,
        email: emailFormControl,
        password: passwordFormControl,
      });
      await this.router.navigateByUrl('/home');
    } catch (error) {
      this.error = error;
    }
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }
}
