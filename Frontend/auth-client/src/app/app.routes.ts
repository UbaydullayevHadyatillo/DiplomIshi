import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { HomePage } from './features/home/home-pages/home-page';
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { VerifyCodePage } from './features/auth/pages/verify-code-page/verify-code-page';
import { ProfilePage } from './features/profile/pages/profile-page/profile-page';
import { RegisterPage } from './features/auth/pages/register-page/register-page';
import { TelegramConnectPage } from './features/auth/pages/telegram-connect-page/telegram-connect-page';
import { ManageSubjectsPage } from './features/admin/pages/manage-subjects/manage-subject';
import { DashboardPage } from './features/dashboard/pages/dashboard-page';
import { AddQuestionPage } from './features/admin/pages/add-questions/add-question';
import { ExamPage } from './features/exam/pages/exam-page/exam-pages';
import { ExamResultPage } from './features/exam/pages/exam-result-page/exam-result-page';
import { MyCoursesPage } from './features/courses/pages/courses/courses-page';
import { ExamReviewPage } from './features/exam/pages/exam-review-page/exam-review-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'register', canActivate: [noAuthGuard], component: RegisterPage },
  { path: 'login', canActivate: [noAuthGuard], component: LoginPage },
  { path: 'verify-code', canActivate: [noAuthGuard], component: VerifyCodePage },
  { path: 'telegram-connect', component: TelegramConnectPage },
  { path: 'dashboard', canActivate: [authGuard], component: DashboardPage },
  { path: 'profile', canActivate: [authGuard], component: ProfilePage },
  { path: 'admin/manage-subject', canActivate: [authGuard], component: ManageSubjectsPage },
  { path: 'admin/manage-subject/:id/add-question', canActivate: [authGuard], component: AddQuestionPage },
  { path: 'my-courses', canActivate: [authGuard], component: MyCoursesPage },
  { path: 'exams/:id', canActivate: [authGuard], component: ExamPage },
  { path: 'exam-result', canActivate: [authGuard], component: ExamResultPage },
  { path: 'exam-review', canActivate: [authGuard], component: ExamReviewPage },
  { path: '**', redirectTo: '' }
];