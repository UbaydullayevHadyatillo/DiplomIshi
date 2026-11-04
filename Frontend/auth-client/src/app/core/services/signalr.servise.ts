import { Injectable, inject, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { SIGNALR_HUB_URL } from '../constants/api.constants';
import { TokenService } from './token.service';

export interface ExamCompletedEvent {
  examResultId: number;
  correctAnswers: number;
  total: number;
  score: number;
}

export interface SessionJoinedEvent {
  userId: string;
  subjectId: number;
  room: string;
  serverTime: string;
}

export interface TimeWarningEvent {
  message: string;
  timeLeftSeconds: number;
}

@Injectable({ providedIn: 'root' })
export class SignalRService implements OnDestroy {
  private readonly tokenService = inject(TokenService);
  private hubConnection: signalR.HubConnection | null = null;

  readonly examCompleted$ = new Subject<ExamCompletedEvent>();
  readonly sessionJoined$ = new Subject<SessionJoinedEvent>();
  
  readonly timeWarning$ = new Subject<TimeWarningEvent>();

  get isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  async startConnection(): Promise<void> {
    if (this.hubConnection && this.isConnected) return;

    const token = this.tokenService.getAccessToken();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        accessTokenFactory: () => token ?? '',
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    this.hubConnection.on('ExamForceCompleted', (data: ExamCompletedEvent) => {
      this.examCompleted$.next(data);
    });

    this.hubConnection.on('SessionJoined', (data: SessionJoinedEvent) => {
      this.sessionJoined$.next(data);
    });

    this.hubConnection.on('ExamTimeWarning', (data: TimeWarningEvent) => {
      this.timeWarning$.next(data);
    });

    try {
      await this.hubConnection.start();
      console.log('SignalR: Muvaffaqiyatli ulandi.');
    } catch (err) {
      console.error('SignalR: Ulanishda xato:', err);
    }
  }

  async joinExamSession(subjectId: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.hubConnection!.invoke('JoinExamSession', subjectId);
    } catch (err) {
      console.error('SignalR: JoinExamSession xatosi:', err);
    }
  }

  async sendTimeWarning(subjectId: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.hubConnection!.invoke('SendTimeWarning', subjectId);
    } catch (err) {
      console.error('SignalR: SendTimeWarning yuborishda xato:', err);
    }
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
    }
  }

  ngOnDestroy(): void {
    this.stopConnection();
  }
}