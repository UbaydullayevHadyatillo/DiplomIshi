import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/api.constants';
import { AuthResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  }

  getLoginIdentifier(): string | null {
    return localStorage.getItem(STORAGE_KEYS.loginIdentifier);
  }

  setLoginIdentifier(identifier: string): void {
    localStorage.setItem(STORAGE_KEYS.loginIdentifier, identifier);
  }

  clearLoginIdentifier(): void {
    localStorage.removeItem(STORAGE_KEYS.loginIdentifier);
  }

  saveAuthData(data: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
    localStorage.setItem(STORAGE_KEYS.accessTokenExpiresAt, data.accessTokenExpiresAt);
    localStorage.setItem(STORAGE_KEYS.refreshTokenExpiresAt, data.refreshTokenExpiresAt);
    localStorage.setItem(STORAGE_KEYS.userName, data.userName);
    localStorage.setItem(STORAGE_KEYS.fullName, data.fullName);
    localStorage.setItem(STORAGE_KEYS.role, data.role);
  }

  clearAuthData(): void {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.accessTokenExpiresAt);
    localStorage.removeItem(STORAGE_KEYS.refreshTokenExpiresAt);
    localStorage.removeItem(STORAGE_KEYS.userName);
    localStorage.removeItem(STORAGE_KEYS.fullName);
    localStorage.removeItem(STORAGE_KEYS.role);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getUserName(): string | null {
    return localStorage.getItem(STORAGE_KEYS.userName);
  }

  getFullName(): string | null {
    return localStorage.getItem(STORAGE_KEYS.fullName);
  }

  getRole(): string | null {
    return localStorage.getItem(STORAGE_KEYS.role);
  }
}