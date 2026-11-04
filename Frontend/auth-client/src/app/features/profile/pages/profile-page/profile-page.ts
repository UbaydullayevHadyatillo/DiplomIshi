import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { AuthService } from '../../../../core/services/auth.service';
import { ErrorMessageService } from '../../../../core/services/error-message.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserProfile } from '../../../../core/models/auth.models';
import { SidebarComponent } from '../../../components/sidebar-component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule, SidebarComponent],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css'
})
export class ProfilePage implements OnInit {
  private readonly authService  = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly errorService = inject(ErrorMessageService);

  readonly isLoading    = signal(true);
  readonly isSaving     = signal(false);
  readonly profile      = signal<UserProfile | null>(null);
  readonly editingField = signal<string | null>(null);
  readonly editValues   = signal({ fullName: '', userName: '', phoneNumber: '' });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.authService.getProfile()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => this.profile.set(res),
        error: (err) => this.notification.error(this.errorService.getMessage(err))
      });
  }

  startEdit(field: string): void {
    const p = this.profile();
    if (!p) return;
    this.editingField.set(field);
    this.editValues.set({
      fullName:    p.fullName,
      userName:    p.userName,
      phoneNumber: p.phoneNumber
    });
  }

  cancelEdit(): void {
    this.editingField.set(null);
  }

  updateEditValue(field: string, value: string): void {
    this.editValues.update(prev => ({ ...prev, [field]: value }));
  }

  saveEdit(): void {
    const dto = this.editValues();
    if (!dto.fullName.trim() || !dto.userName.trim() || !dto.phoneNumber.trim()) {
      this.notification.error("Barcha maydonlarni to'ldiring.");
      return;
    }

    this.isSaving.set(true);
    this.authService.updateProfile(dto)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.notification.success("Ma'lumotlar muvaffaqiyatli yangilandi.");
          this.editingField.set(null);
          this.loadProfile();
        },
        error: (err) => this.notification.error(this.errorService.getMessage(err))
      });
  }
}