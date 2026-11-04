import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LmsService } from '../../../../core/services/lms.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ErrorMessageService } from '../../../../core/services/error-message.service';
import { SidebarComponent } from '../../../components/sidebar-component';

@Component({
  selector: 'app-add-question',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, SelectButtonModule, SidebarComponent],
  templateUrl: './add-question.html',
  styleUrl: './add-question.css'
})
export class AddQuestionPage implements OnInit {
  private readonly lmsService = inject(LmsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly errorMessageService = inject(ErrorMessageService);

  readonly subjectId = signal<number | null>(null);
  readonly questionText = signal('');
  readonly selectedCorrect = signal<string[]>([]);
  readonly isSaving = signal(false);

  readonly options = signal([
    { label: 'A', text: '' },
    { label: 'B', text: '' },
    { label: 'C', text: '' },
    { label: 'D', text: '' }
  ]);

  readonly correctOptions = [
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
    { label: 'D', value: 'D' }
  ];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.subjectId.set(Number(idParam));
    }
  }

  updateOptionText(index: number, val: string): void {
    this.options.update(opts => {
      const copy = [...opts];
      copy[index] = { ...copy[index], text: val };
      return copy;
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/manage-subject']);
  }

  saveQuestion(): void {
    const subjectId = this.subjectId();
    const text = this.questionText().trim();
    const selectedValues = this.selectedCorrect();

    if (!subjectId || !text) {
      this.notification.error('Savol matni kiritilishi shart!');
      return;
    }

    if (selectedValues.length === 0) {
      this.notification.error("Kamida bitta to'g'ri javobni tanlang!");
      return;
    }

    if (selectedValues.length > 3) {
      this.notification.error("Ko'pi bilan 3 ta to'g'ri javob tanlash mumkin!");
      return;
    }

    const options = this.options().map(opt => ({
      text: opt.text.trim(),
      isCorrect: selectedValues.includes(opt.label)
    }));

    if (options.some(o => !o.text)) {
      this.notification.error("Barcha variantlarni to'ldiring!");
      return;
    }

    const payload = {
      subjectId,
      text,
      options
    };

    this.isSaving.set(true);
    this.lmsService.createQuestion(payload).subscribe({
      next: () => {
        this.notification.success('Savol muvaffaqiyatli saqlandi!');
        // Formni tozalash
        this.questionText.set('');
        this.selectedCorrect.set([]);
        this.options.set([
          { label: 'A', text: '' },
          { label: 'B', text: '' },
          { label: 'C', text: '' },
          { label: 'D', text: '' }
        ]);
        this.isSaving.set(false);
      },
      error: (err) => {
        const msg = this.errorMessageService.getMessage(err);
        this.notification.error(msg);
        this.isSaving.set(false);
      }
    });
  }
}