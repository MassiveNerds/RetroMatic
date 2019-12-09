import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  error: Error;
  isSubmitted: boolean;
  resetPasswordForm = new FormGroup({
    emailFormControl: new FormControl('', [
      Validators.required,
      Validators.email,
    ])
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  async resetPassword() {
    if (!this.resetPasswordForm.valid) {
      return;
    }
    try {
      const { emailFormControl } = this.resetPasswordForm.value;
      await this.authService.resetPassword(emailFormControl);
      this.isSubmitted = true;
      this.snackBar.open('A password reset email has been sent.', undefined, {
        duration: 3000
      });
    } catch (error) {
      this.error = error;
    }
  }

  goToLogin() {
    this.router.navigateByUrl('/login');
  }

}
