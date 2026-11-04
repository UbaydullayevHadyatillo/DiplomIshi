import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LmsService } from '../../../../core/services/lms.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SidebarComponent } from '../../../components/sidebar-component';
import { Subject } from '../../../../core/models/lms.models';

@Component({
  selector: 'app-manage-subject',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, SidebarComponent],
  templateUrl: './manage-subject.html',
  styleUrl: './manage-subject.css'
})
export class ManageSubjectsPage implements OnInit {
  private readonly lmsService = inject(LmsService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly subjects = signal<Subject[]>([]);
  readonly isLoading = signal(false);
  newSubjectName = '';

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.lmsService.getSubjects().subscribe({
      next: (data: Subject[]) => this.subjects.set(data),
      error: () => this.notification.error('Fanlarni yuklashda xatolik.')
    });
  }

  goToAddQuestion(subject: Subject): void {
    this.router.navigate(['/admin/manage-subject', subject.id, 'add-question']);
  }

  addSubject(): void {
    const name = this.newSubjectName.trim();
    if (!name) {
      this.notification.warn("Fan nomini kiriting.");
      return;
    }

    this.isLoading.set(true);
    this.lmsService.createSubject(name).subscribe({
      next: () => {
        this.notification.success("Fan muvaffaqiyatli qo'shildi!");
        this.newSubjectName = '';
        this.loadSubjects();
        this.isLoading.set(false);
      },
      error: () => {
        this.notification.error("Fanni qo'shishda xatolik yuz berdi.");
        this.isLoading.set(false);
      }
    });
  }
}