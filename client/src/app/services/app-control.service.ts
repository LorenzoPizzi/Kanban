import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppInactivityStatus {
  enabled: boolean;
  idleMs: number;
  warningMs: number;
  lastActivityAt: string;
  warningStartedAt: string | null;
  shutdownAt: string | null;
}

export interface AppControlStatus {
  status: string;
  appName: string;
  inactivity: AppInactivityStatus;
}

@Injectable({ providedIn: 'root' })
export class AppControlService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/app-control';

  getStatus(): Observable<AppControlStatus> {
    return this.http.get<AppControlStatus>(`${this.baseUrl}/status`);
  }

  recordActivity(): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/activity`, {});
  }

  cancelIdleWarning(): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/cancel-idle-warning`, {});
  }

  quit(): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/quit`, {});
  }
}
