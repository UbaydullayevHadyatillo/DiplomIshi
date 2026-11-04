export const API_BASE_URL = 'https://localhost:7268/api';
export const SIGNALR_HUB_URL = 'https://localhost:7268/api/ExamHub';

export const AUTH_ENDPOINTS = {
  register:      `${API_BASE_URL}/Auth/register`,
  requestLink:   `${API_BASE_URL}/Auth/request-link`,
  requestCode:   `${API_BASE_URL}/Auth/request-code`,
  verifyCode:    `${API_BASE_URL}/Auth/verify-code`,
  refresh:       `${API_BASE_URL}/Auth/refresh`,
  logout:        `${API_BASE_URL}/Auth/logout`,
  profile:       `${API_BASE_URL}/Auth/profile`,
  updateProfile: `${API_BASE_URL}/Auth/update-profile`,
};

export const ADMIN_ENDPOINTS = {
  subjects:   `${API_BASE_URL}/Admin/subjects`,
  questions:  `${API_BASE_URL}/Admin/questions`,
};

export const EXAM_ENDPOINTS = {
  start:  (subjectId: number) => `${API_BASE_URL}/Exam/start/${subjectId}`,
  submit: `${API_BASE_URL}/Exam/submit`,
  history: `${API_BASE_URL}/Exam/history`,
};

export const STORAGE_KEYS = {
  accessToken:           'access_token',
  refreshToken:          'refresh_token',
  accessTokenExpiresAt:  'access_token_expires_at',
  refreshTokenExpiresAt: 'refresh_token_expires_at',
  userName:              'user_name',
  fullName:              'full_name',
  role:                  'role',
  loginIdentifier:       'login_identifier',
};