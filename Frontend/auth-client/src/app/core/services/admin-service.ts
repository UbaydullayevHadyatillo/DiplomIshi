import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:7268/api/admin';

  // Barcha fanlarni olish
  getSubjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/subjects`);
  }

  // Yangi fan qo'shish
  createSubject(name: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/subjects`, { name });
  }

  // Fanga yangi savol qo'shish
  createQuestion(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/questions`, payload);
  }
}