import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthStateService } from '../../../core/services/auth-state.service';
import { TokenService } from '../../../core/services/token.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-pages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css'
})
export class DashboardPage {
  private readonly router = inject(Router);
  private readonly authState = inject(AuthStateService);
  private readonly tokenService = inject(TokenService);
  private readonly authService = inject(AuthService);

  readonly role = computed(() => this.authState.role());
  readonly fullName = computed(() => this.authState.fullName());
  readonly userName = computed(() => this.authState.userName());
  readonly isAdmin = computed(() => this.role() === 'Admin');

  navigateTo(path: string): void { this.router.navigate([path]); }

  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) { this.clearAndNavigate(); return; }
    this.authService.logout({ refreshToken }).subscribe({
      next: () => this.clearAndNavigate(),
      error: () => this.clearAndNavigate()
    });
  }

  private clearAndNavigate(): void {
    this.tokenService.clearAuthData();
    this.authState.clear();
    this.router.navigate(['/login']);
  }
}