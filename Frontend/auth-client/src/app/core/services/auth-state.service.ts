import { Injectable, signal } from '@angular/core';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  readonly isAuthenticated = signal(false);
  readonly fullName = signal<string | null>(null);
  readonly userName = signal<string | null>(null);
  readonly role = signal<string | null>(null);

  constructor(private tokenService: TokenService) {
    this.syncFromStorage();
  }

  syncFromStorage(): void {
    this.isAuthenticated.set(this.tokenService.isLoggedIn());
    this.fullName.set(this.tokenService.getFullName());
    this.userName.set(this.tokenService.getUserName());
    this.role.set(this.tokenService.getRole());
  }

  clear(): void {
    this.isAuthenticated.set(false);
    this.fullName.set(null);
    this.userName.set(null);
    this.role.set(null);
  }
}