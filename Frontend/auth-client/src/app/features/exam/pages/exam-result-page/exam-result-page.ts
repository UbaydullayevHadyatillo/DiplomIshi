import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exam-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-result-page.html',
  styleUrl: './exam-result-page.css'
})
export class ExamResultPage implements OnInit {
  private readonly router = inject(Router);

  // Signallar - HTML bilan bog'lanish uchun
  readonly correctCount = signal<number>(0);
  readonly totalCount = signal<number>(0);
  readonly percentage = signal<number>(0);

  ngOnInit() {
    const data = localStorage.getItem('last_exam_result');
    if (data) {
      const res = JSON.parse(data);
      // Signallarga qiymat berish (.set orqali)
      this.correctCount.set(res.correct);
      this.totalCount.set(res.total);
      this.percentage.set(res.score);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  goToReview() {
    this.router.navigate(['/exam-review']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}