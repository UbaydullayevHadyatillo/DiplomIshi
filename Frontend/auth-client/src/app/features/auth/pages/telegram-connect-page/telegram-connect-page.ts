import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-telegram-connect-page',
  standalone: true,
  imports: [CommonModule, ButtonModule], 
  templateUrl: './telegram-connect-page.html',
  styleUrl: './telegram-connect-page.css'
})
export class TelegramConnectPage {
  private readonly router = inject(Router);

  get botLink(): string {
    const fullLink = localStorage.getItem('telegram_bot_full_link');
    return fullLink ?? 'https://t.me/Ubaydullayev_auth_bot';
  }

  get qrCodeUrl(): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.botLink)}`;
  }

  goToLogin() {
    localStorage.removeItem('telegram_bot_full_link');
    this.router.navigate(['/login']);
  }
}