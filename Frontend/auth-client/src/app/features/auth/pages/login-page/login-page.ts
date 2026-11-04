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
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly errorMessageService = inject(ErrorMessageService);
  private readonly notificationService = inject(NotificationService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);

  readonly form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]]
  });

  get identifierControl() { return this.form.controls.identifier; }

  /** Home sahifasiga qaytish */
  goHome(): void {
    this.router.navigate(['/']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const identifier = this.form.controls.identifier.value.trim();
    this.isLoading.set(true);

    this.authService.requestCode({ identifier })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: any) => {
          this.tokenService.setLoginIdentifier(identifier);

          // Backend JSON qaytaradi: { message: "Kod yuborildi." }
          // AuthService responseType:'text' qaytarishi uchun parse qilamiz
          let message = 'Kod yuborildi.';
          if (typeof response === 'string') {
            try {
              const parsed = JSON.parse(response);
              message = parsed?.message ?? message;
            } catch {
              message = response || message;
            }
          } else if (response?.message) {
            message = response.message;
          }

          // Toast ko'rinadi, KEYIN navigate qilinadi — toast navigate'dan keyin ham 3s yashaydi
          this.notificationService.success(message);
          this.router.navigate(['/verify-code']);
        },
        error: (error) => {
          const message = this.errorMessageService.getMessage(error);
          this.notificationService.error(message);
        }
      });
  }
}