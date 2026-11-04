import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageService {
  getMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      if (error.error?.message) {
        return error.error.message;
      }

      if (error.status === 0) {
        return 'Backend bilan ulanishda xatolik yuz berdi.';
      }

      if (error.status === 400) {
        return 'So‘rov noto‘g‘ri yuborildi.';
      }

      if (error.status === 401) {
        return 'Avtorizatsiya xatosi yuz berdi.';
      }

      if (error.status === 404) {
        return 'So‘ralgan resurs topilmadi.';
      }

      if (error.status >= 500) {
        return 'Serverda ichki xatolik yuz berdi.';
      }
    }

    return 'Noma’lum xatolik yuz berdi.';
  }
}