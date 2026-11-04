export interface RequestCodeRequest {
  identifier: string;
}

export interface VerifyCodeRequest {
  identifier: string;
  code: string;
}

export interface RegisterRequest {
  fullName: string;
  userName: string;
  phoneNumber: string;
}

export interface RequestLinkRequest {
  identifier: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  userName: string;
  fullName: string;
  role: string;
}

export interface ApiMessageResponse {
  message: string;
}

export interface RequestLinkResponse {
  message: string;
  linkCode: string;
  botUserName: string;
  expiresAt: string;
}

export interface UserProfile {
  message: string;
  userId: string;
  userName: string;
  fullName: string;
  phoneNumber: string;
  role: string;
}