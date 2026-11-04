import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly messageService = inject(MessageService);

  success(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Muvaffaqiyatli',
      detail: message,
      life: 3000
    });
  }

  error(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Xatolik',
      detail: message,
      life: 4000
    });
  }

  info(message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Ma\'lumot',
      detail: message,
      life: 3000
    });
  }

  warn(message: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Ogohlantirish',
      detail: message,
      life: 4000
    });
  }
}