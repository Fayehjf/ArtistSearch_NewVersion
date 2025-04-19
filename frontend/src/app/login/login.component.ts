import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
    selector: 'app-access-panel',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {
    loginForm: FormGroup;
    private destroy$ = new Subject<void>();

    submissionState = {
        loading: false,
        error: '',
        processing: false,
        lastError: ''
    };

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private notificationService: NotificationService
    ) {
        this.loginForm = this.formBuilder.group({
            credential: ['', [Validators.required, Validators.email]],
            secret: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    initiateAuth() {
        this.handleLogin();
    }

    get credential() { return this.loginForm.get('credential'); }
    
    get secret() { return this.loginForm.get('secret'); }

    handleLogin(): void {
        if (this.loginForm.invalid) return;

        this.submissionState.processing = true;
        this.submissionState.error = '';

        const credentials = {
            email: this.loginForm.value.credential!.trim().toLowerCase(),
            password: this.loginForm.value.secret!
        };

        this.authService.login(credentials)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    // Notify the user of a successful login
                    this.notificationService.showNotification('success', 'Logged in successfully!');
                    this.handleNavigation();
                  },
                  error: (err) => {
                    this.notificationService.showNotification('error', 'Authentication failed. Please check your credentials.');
                    this.handleError(err);
                  }
            });
    }

    private handleNavigation(): void {
        this.submissionState.processing = false;
        const returnUrl = this.router.url.includes('login') ? '/' : this.router.url;
        this.router.navigateByUrl(returnUrl);
    }

    private handleError(error: any): void {
        this.submissionState.processing = false;
        this.submissionState.error = error.error?.message || 'Authentication failed. Please check your credentials.';
        this.loginForm.get('secret')?.reset();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}