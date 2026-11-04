import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ADMIN_ENDPOINTS, EXAM_ENDPOINTS } from '../constants/api.constants';
import { Subject } from '../models/lms.models';

/**
 * LmsService — fanlari va imtihon bilan bog'liq barcha HTTP so'rovlar.
 * AdminService olib tashlandi — uning funksiyalari bu yerga ko'chirildi.
 */
@Injectable({ providedIn: 'root' })
export class LmsService {
  private readonly http = inject(HttpClient);

  // ── Admin: Fanlar ──────────────────────────────────────────────────────────

  getSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(ADMIN_ENDPOINTS.subjects);
  }

  createSubject(name: string): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(ADMIN_ENDPOINTS.subjects, { name });
  }

  // ── Admin: Savollar ────────────────────────────────────────────────────────

  createQuestion(payload: {
    subjectId: number;
    text: string;
    options: { text: string; isCorrect: boolean }[];
  }): Observable<{ message: string; id: number }> {
    return this.http.post<{ message: string; id: number }>(ADMIN_ENDPOINTS.questions, payload);
  }

  // ── Imtihon ───────────────────────────────────────────────────────────────

  startExam(subjectId: number): Observable<{
  subjectName: string;
  questions: { id: number; text: string; options: { id: number; text: string }[] }[];
}> {
  // Brauzer keshini butunlay o'chirish uchun headerlar:
  const headers = new HttpHeaders({
    'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  return this.http.get<any>(EXAM_ENDPOINTS.start(subjectId), { headers }); // <-- { headers } qo'shildi
}

  submitExam(payload: {
    subjectId: number;
    answers: { questionId: number; selectedOptionIds: number[] }[];
  }): Observable<{
    examResultId: number;
    correctAnswers: number;
    total: number;
    score: number;
    reviewData: any[];
  }> {
    return this.http.post<any>(EXAM_ENDPOINTS.submit, payload);
  }

  getExamHistory(): Observable<any[]> {
    return this.http.get<any[]>(EXAM_ENDPOINTS.history);
  }
}