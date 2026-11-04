import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { LmsService } from '../../../../core/services/lms.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { SignalRService } from '../../../../core/services/signalr.servise';
import { ButtonModule } from 'primeng/button';

interface ExamQuestion {
  id: number;
  text: string;
  options: { id: number; text: string }[];
}

interface UserAnswer {
  questionId: number;
  selectedOptionIds: number[];
}

@Component({
  selector: 'app-exam-page',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './exam-page.html',
  styleUrl: './exam-page.css'
})
export class ExamPage implements OnInit, OnDestroy {
  private readonly lmsService     = inject(LmsService);
  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);
  private readonly notification   = inject(NotificationService);
  private readonly signalRService = inject(SignalRService);

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private signalRSub: Subscription | null = null;
  private warningSub: Subscription | null = null; 
  private subjectId!: number;

  readonly isLoading     = signal(true);
  readonly isSubmitting  = signal(false);
  readonly subjectName   = signal('');
  readonly questions     = signal<ExamQuestion[]>([]);
  readonly currentIdx    = signal(0);
  readonly userAnswers   = signal<UserAnswer[]>([]);
  readonly timeLeft      = signal<number>(600); 
  
  readonly isTimeCritical = signal(false);
  private hasSentWarning  = false; 

  readonly currentQuestion = computed(() => this.questions()[this.currentIdx()]);
  readonly answeredCount   = computed(() => this.userAnswers().filter(a => a.selectedOptionIds.length > 0).length);

  readonly formattedTime = computed(() => {
    const m = Math.floor(this.timeLeft() / 60);
    const s = this.timeLeft() % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  ngOnInit(): void {
    this.subjectId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.subjectId) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadExam();
    this.initSignalR();
  }

  private loadExam(): void {
    this.isLoading.set(true);
    this.lmsService.startExam(this.subjectId).subscribe({
      next: (res) => {
        this.subjectName.set(res.subjectName);
        this.questions.set(res.questions);

        const initial = res.questions.map(q => ({ questionId: q.id, selectedOptionIds: [] }));
        this.userAnswers.set(initial);

        this.isLoading.set(false);
        this.startTimer();
      },
      error: () => {
        this.notification.error("Imtihon yuklanishida xatolik!");
        this.router.navigate(['/my-courses']);
      }
    });
  }

  private async initSignalR(): Promise<void> {
    await this.signalRService.startConnection();
    await this.signalRService.joinExamSession(this.subjectId);

    this.signalRSub = this.signalRService.examCompleted$.subscribe({
      next: (res) => {
        this.notification.warn("Vaqtingiz tugadi! Imtihon avtomat yakunlandi.");
        this.handleForceSuccess(res);
      }
    });

    this.warningSub = this.signalRService.timeWarning$.subscribe({
      next: (data) => {
        console.log('SignalR xabari keldi:', data.message);
        
        this.isTimeCritical.set(true);
        
        this.notification.warn(data.message);
      }
    });
  }

  private startTimer(): void {
    this.intervalId = setInterval(() => {
      const currentLeft = this.timeLeft();
      if (currentLeft > 0) {
        this.timeLeft.set(currentLeft - 1);

        if (currentLeft - 1 === 120 && !this.hasSentWarning) {
          this.hasSentWarning = true;
          this.signalRService.sendTimeWarning(this.subjectId);
        }

      } else {
        if (this.intervalId) clearInterval(this.intervalId);
        this.submitExam(true);
      }
    }, 1000);
  }

  toggleOption(question: ExamQuestion, optionId: number): void {
    this.userAnswers.update(answers => {
      return answers.map(ans => {
        if (ans.questionId === question.id) {
          const exists = ans.selectedOptionIds.includes(optionId);
          const updated = exists
            ? ans.selectedOptionIds.filter(id => id !== optionId)
            : [...ans.selectedOptionIds, optionId];
          return { ...ans, selectedOptionIds: updated };
        }
        return ans;
      });
    });
  }

  isSelected(questionId: number, optionId: number): boolean {
    const ans = this.userAnswers().find(a => a.questionId === questionId);
    return ans ? ans.selectedOptionIds.includes(optionId) : false;
  }

  isAnswered(questionId: number): boolean {
    const ans = this.userAnswers().find(a => a.questionId === questionId);
    return ans ? ans.selectedOptionIds.length > 0 : false;
  }

  submitExam(isAuto = false): void {
    if (this.isSubmitting()) return;
    if (!isAuto && !confirm("Imtihonni topshirmoqchimisiz?")) return;

    this.isSubmitting.set(true);
    if (this.intervalId) clearInterval(this.intervalId);

    const payload = {
      subjectId: this.subjectId,
      answers: this.userAnswers().map(ans => ({
        questionId: ans.questionId,
        selectedOptionIds: ans.selectedOptionIds
      }))
    };

    this.lmsService.submitExam(payload).subscribe({
      next: (res) => {
        this.saveResultToStorage({
          correct: res.correctAnswers,
          total: res.total,
          score: res.score
        });
        localStorage.setItem('last_exam_review_data', JSON.stringify(res.reviewData));
        localStorage.setItem('last_user_answers', JSON.stringify(this.userAnswers()));
        this.router.navigate(['/exam-result']);
      },
      error: () => {
        this.notification.error("Natijani saqlashda xatolik yuz berdi! Qayta urinib ko'ring.");
        this.isSubmitting.set(false);
        this.startTimer(); 
      }
    });
  }

  private handleForceSuccess(res: any): void {
    this.saveResultToStorage({
      correct: res.correctAnswers,
      total: res.total,
      score: res.score
    });
    this.router.navigate(['/exam-result']);
  }

  private saveResultToStorage(data: { correct: number; total: number; score: number }): void {
    localStorage.setItem('last_exam_result', JSON.stringify(data));
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions().length) {
      this.currentIdx.set(index);
    }
  }

  nextQuestion(): void { this.goToQuestion(this.currentIdx() + 1); }
  prevQuestion(): void { this.goToQuestion(this.currentIdx() - 1); }

  getOptionLabel(index: number): string {
    return ['A', 'B', 'C', 'D'][index] ?? String(index + 1);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.signalRSub) this.signalRSub.unsubscribe();
    if (this.warningSub) this.warningSub.unsubscribe(); 
    this.signalRService.stopConnection();
  }
}