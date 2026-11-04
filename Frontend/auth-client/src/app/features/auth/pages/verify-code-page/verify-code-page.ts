import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { ErrorMessageService } from '../../../../core/services/error-message.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TokenService } from '../../../../core/services/token.service';
import { AuthStateService } from '../../../../core/services/auth-state.service';

@Component({
  selector: 'app-verify-code-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify-code-page.html',
  styleUrl: './verify-code-page.css'
})
export class VerifyCodePage implements OnInit {
  private readonly fb              = inject(FormBuilder);
  private readonly authService     = inject(AuthService);
  private readonly errorService    = inject(ErrorMessageService);
  private readonly notification    = inject(NotificationService);
  private readonly tokenService    = inject(TokenService);
  private readonly authState       = inject(AuthStateService);
  private readonly router          = inject(Router);

  readonly isLoading    = signal(false);
  readonly identifier   = signal('');

  readonly form = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  get codeControl() { return this.form.controls.code; }

  ngOnInit(): void {
    const stored = this.tokenService.getLoginIdentifier();
    if (!stored) {
      this.notification.warn("Avval login sahifasidan kod so'rang.");
      this.router.navigate(['/login']);
      return;
    }
    this.identifier.set(stored);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.authService.verifyCode({
      identifier: this.identifier(),
      code: this.codeControl.value.trim()
    })
    .pipe(finalize(() => this.isLoading.set(false)))
    .subscribe({
      next: (response) => {
        this.tokenService.saveAuthData(response);
        this.tokenService.clearLoginIdentifier();
        this.authState.syncFromStorage();
        this.notification.success("Tizimga muvaffaqiyatli kirdingiz!");
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const msg = this.errorService.getMessage(err);
        this.notification.error(msg);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}