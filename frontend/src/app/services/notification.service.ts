import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppNotification {
  id: number;
  type: 'success' | 'danger' | 'error' | 'info' | 'warning';
  message: string;
  autoClose?: boolean;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  private counter = 0;

  showNotification(
    type: 'success' | 'danger' | 'error' | 'info' | 'warning',
    message: string,
    autoClose = true,
    duration = 3000
  ): void {
    this.counter++;
    const newNotification: AppNotification = {
      id: this.counter,
      type,
      message,
      autoClose,
      duration
    };
    // Add the new notification at the beginning or end as per your design
    const current = this.notificationsSubject.getValue();
    this.notificationsSubject.next([...current, newNotification]);

    if (autoClose) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, duration);
    }
  }

  removeNotification(id: number): void {
    const updated = this.notificationsSubject.getValue().filter(n => n.id !== id);
    this.notificationsSubject.next(updated);
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
  }
}