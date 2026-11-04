export interface Subject {
  id: number;
  name: string;
}

export interface Option {
  id?: number;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id?: number;
  subjectId: number;
  text: string;
  options: Option[];
}

export interface ExamResult {
  message: string;
  correctAnswers: number;
  total: number;
  score: number;
}