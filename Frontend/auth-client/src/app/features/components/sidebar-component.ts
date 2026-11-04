import { Component, inject, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthStateService } from '../../core/services/auth-state.service';
import { TokenService } from '../../core/services/token.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-component.html',
  styleUrl: './sidebar-component.css'
})
export class SidebarComponent {
  @Input() activeRoute: 'dashboard' | 'profile' | 'my-courses' | 'admin' | '' = '';

  private readonly router = inject(Router);
  private readonly authState = inject(AuthStateService);
  private readonly tokenService = inject(TokenService);
  private readonly authService = inject(AuthService);

  readonly isAdmin = computed(() => this.authState.role() === 'Admin');

  go(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      this.clearAndNavigate();
      return;
    }
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