import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { LmsService } from '../../../../core/services/lms.service';
import { ErrorMessageService } from '../../../../core/services/error-message.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SidebarComponent } from '../../../components/sidebar-component';
import { Subject } from '../../../../core/models/lms.models';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './courses-page.html',
  styleUrls: ['./courses-page.css']
})
export class MyCoursesPage implements OnInit {
  private readonly lmsService = inject(LmsService);
  private readonly router = inject(Router);
  private readonly errorMessageService = inject(ErrorMessageService);
  private readonly notification = inject(NotificationService);

  readonly subjects = signal<Subject[]>([]);
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.isLoading.set(true);
    this.lmsService.getSubjects()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.subjects.set(data),
        error: (err) => {
          const message = this.errorMessageService.getMessage(err);
          this.notification.error(message);
        }
      });
  }

  startExam(id: number): void {
  // Debug qilish uchun konsolga ID ni chiqarib ko'ramiz
  console.log('Imtihon boshlanayotgan fanning ID raqami:', id);

  if (!id) {
    console.error('Xatolik: Fan ID raqami topilmadi yoki kelmadi!');
    return;
  }

  // DIQQAT: Manzil to'g'ri bo'lishi shart, app.routes.ts dagi 'exams/:id' ga mos ravishda!
  this.router.navigate(['/exams', id]); 
}
}