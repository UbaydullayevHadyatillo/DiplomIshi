import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exam-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-review-page.html',
  styleUrl: './exam-review-page.css'
})
export class ExamReviewPage implements OnInit {
  private readonly router = inject(Router);

  readonly questions   = signal<any[]>([]);
  readonly userAnswers = signal<any[]>([]);
  readonly currentIdx  = signal(0);

  readonly currentQuestion = computed(() => this.questions()[this.currentIdx()]);

  ngOnInit(): void {
    const reviewData  = localStorage.getItem('last_exam_review_data');
    const answersData = localStorage.getItem('last_user_answers');

    if (reviewData && answersData) {
      try {
        this.questions.set(JSON.parse(reviewData));
        this.userAnswers.set(JSON.parse(answersData));
      } catch {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Variant klassini aniqlash.
   * BUG FIX: Avval localStorage dan har safar o'qilyotgan edi — endi signal dan o'qiydi.
   */
  getOptionClass(optionId: number): string {
    const question   = this.currentQuestion();
    if (!question) return 'opt-default';

    const userAnswer = this.userAnswers().find((a: any) => a.questionId === question.questionId);
    const isSelected = userAnswer?.selectedOptionIds?.includes(optionId) ?? false;

    // reviewData da isCorrect maydoni mavjud (backend qaytaradi)
    const option    = question.options?.find((o: any) => o.id === optionId);
    const isCorrect = option?.isCorrect ?? false;

    if (isSelected && isCorrect)  return 'opt-user-correct';
    if (isSelected && !isCorrect) return 'opt-user-wrong';
    if (!isSelected && isCorrect) return 'opt-system-correct';
    return 'opt-default';
  }

  /** Variantga harf belgisi qaytarish (index bo'yicha) */
  getOptionLabel(index: number): string {
    return ['A) ', 'B) ', 'C) ', 'D) '][index] ?? `${index + 1}) `;
  }

  next(): void {
    if (this.currentIdx() < this.questions().length - 1) {
      this.currentIdx.update(i => i + 1);
    }
  }

  prev(): void {
    if (this.currentIdx() > 0) {
      this.currentIdx.update(i => i - 1);
    }
  }

  goBack(): void {
    this.router.navigate(['/exam-result']);
  }
}