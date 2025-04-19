import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    fullname = '';
    email = '';
    password = '';
    errors: { [key: string]: string } = {};
    isLoading = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    onRegister(form: NgForm): void {
        if (form.invalid) return;

        this.isLoading = true;
        this.errors = {};

        const payload = {
            fullname: this.fullname.trim(),
            email: this.email.trim().toLowerCase(),
            password: this.password
        };

        this.authService.register(payload).subscribe({
            next: () => {
                this.router.navigate(['/']);
                this.isLoading = false;
            },
            error: (err) => {
                this.isLoading = false;
                if (err.status === 400 && err.error?.fieldErrors) {
                    this.errors = err.error.fieldErrors;
                } else {
                    this.errors.general = 'Registration failed. Please try again.';
                }
            }
        });
    }
}