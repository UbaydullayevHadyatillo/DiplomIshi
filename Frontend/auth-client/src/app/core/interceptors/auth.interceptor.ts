import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { AuthStateService } from '../services/auth-state.service';
import { AUTH_ENDPOINTS } from '../constants/api.constants';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const tokenService     = inject(TokenService);
  const authService      = inject(AuthService);
  const authStateService = inject(AuthStateService);
  const router           = inject(Router);

  const accessToken = tokenService.getAccessToken();

  // Bu endpointlarga token qo'shilmaydi
  const skipTokenUrls = [
    AUTH_ENDPOINTS.register,
    AUTH_ENDPOINTS.requestLink,
    AUTH_ENDPOINTS.requestCode,
    AUTH_ENDPOINTS.verifyCode,
    AUTH_ENDPOINTS.refresh,
    AUTH_ENDPOINTS.logout,
  ];

  const shouldSkip = skipTokenUrls.some(url => req.url.includes(url));

  let authReq = req;
  if (accessToken && !shouldSkip) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !shouldSkip) {
        return handle401(error, req, next, tokenService, authService, authStateService, router);
      }
      return throwError(() => error);
    })
  );
};

function handle401(
  error: HttpErrorResponse,
  originalReq: HttpRequest<unknown>, // <--- any o'rniga HttpRequest<unknown> qo'yildi
  next: HttpHandlerFn,               // <--- any o'rniga HttpHandlerFn qo'yildi
  tokenService: TokenService,
  authService: AuthService,
  authStateService: AuthStateService,
  router: Router
): Observable<HttpEvent<unknown>> {  // <--- Funksiya nima qaytarishi aniq ko'rsatildi
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = tokenService.getRefreshToken();
    if (refreshToken) {
      return authService.refreshToken({ refreshToken }).pipe(
        switchMap((response: any) => { // <--- response uchun tip (yoki o'zingizning interfeysingizni qo'ying)
          isRefreshing = false;
          tokenService.saveAuthData(response);
          authStateService.syncFromStorage();
          refreshTokenSubject.next(response.accessToken);

          return next(originalReq.clone({
            setHeaders: { Authorization: `Bearer ${response.accessToken}` }
          }));
        }),
        catchError((refreshErr) => {
          isRefreshing = false;
          tokenService.clearAuthData();
          authStateService.clear();
          router.navigate(['/login']);
          return throwError(() => refreshErr);
        })
      );
    } else {
      isRefreshing = false;
      tokenService.clearAuthData();
      authStateService.clear();
      router.navigate(['/login']);
      return throwError(() => error);
    }
  }

  // Boshqa so'rovlar refresh tugaguncha kutadi
  return refreshTokenSubject.pipe(
    filter((token): token is string => token !== null), // <--- TypeScript turini aniqlashtirish uchun
    take(1),
    switchMap(token => next(originalReq.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    })))
  );
}