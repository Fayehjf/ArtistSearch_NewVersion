import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppNotification, NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notifications$: Observable<AppNotification[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notifications$;
  }

  ngOnInit(): void {}

  remove(id: number): void {
    this.notificationService.removeNotification(id);
  }
}