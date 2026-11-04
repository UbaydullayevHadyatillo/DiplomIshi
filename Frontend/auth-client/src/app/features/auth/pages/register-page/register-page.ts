import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { ErrorMessageService } from '../../../../core/services/error-message.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TokenService } from '../../../../core/services/token.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css'
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly errorMessageService = inject(ErrorMessageService);
  private readonly notificationService = inject(NotificationService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    userName: ['', [Validators.required, Validators.minLength(3)]],
    phoneNumber: ['', [Validators.required, Validators.minLength(9)]]
  });

  submit(): void {
    this.isLoading.set(true);

    // features/auth/pages/register-page/register-page.ts faylida submit() metodi ichida:

    this.authService.register({
      fullName: this.form.controls.fullName.value.trim(),
      userName: this.form.controls.userName.value.trim(),
      phoneNumber: this.form.controls.phoneNumber.value.trim()
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: any) => {
          this.notificationService.success(response.message);

          if (response && response.botLink) {
            localStorage.setItem('telegram_bot_full_link', response.botLink);
          }

          const username = this.form.controls.userName.value.trim();
          this.tokenService.setLoginIdentifier(username);
          this.router.navigate(['/telegram-connect']);
        },
        error: (error) => { /* ... */ }
      });
  }

  goToLogin(): void { this.router.navigate(['/login']); }
  get fullNameControl() { return this.form.controls.fullName; }
  get userNameControl() { return this.form.controls.userName; }
  get phoneNumberControl() { return this.form.controls.phoneNumber; }
}