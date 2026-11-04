import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ApiMessageResponse,
  AuthResponse,
  LogoutRequest,
  RefreshTokenRequest,
  RegisterRequest,
  RequestCodeRequest,
  RequestLinkRequest,
  RequestLinkResponse,
  UserProfile,
  VerifyCodeRequest
} from '../models/auth.models';
import { API_BASE_URL, AUTH_ENDPOINTS } from '../constants/api.constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  register(payload: RegisterRequest): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(AUTH_ENDPOINTS.register, payload);
  }

  requestLink(payload: RequestLinkRequest): Observable<RequestLinkResponse> {
    return this.http.post<RequestLinkResponse>(AUTH_ENDPOINTS.requestLink, payload);
  }

  requestCode(payload: RequestCodeRequest): Observable<any> {
    return this.http.post(AUTH_ENDPOINTS.requestCode, payload, {
      responseType: 'text'
    });
  }

  verifyCode(payload: VerifyCodeRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(AUTH_ENDPOINTS.verifyCode, payload);
  }

  refreshToken(payload: RefreshTokenRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(AUTH_ENDPOINTS.refresh, payload);
  }

  logout(payload: LogoutRequest): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(AUTH_ENDPOINTS.logout, payload);
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(AUTH_ENDPOINTS.profile);
  }
  updateProfile(dto: any): Observable<any> {
    return this.http.put(API_BASE_URL+`/Auth/update-profile`, dto);
  }
}