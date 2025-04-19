import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

interface UserState {
    isLoggedIn: boolean;
    profile?: {
        fullname: string;
        email: string;
        avatar: string;
    };
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private state = new BehaviorSubject<UserState>({
        isLoggedIn: false
    });

    constructor(private authService: AuthService) {
        this.initializeAuthState();
    }

    get currentUser() {
        return this.state.asObservable();
    }

    private initializeAuthState() {
        this.authService.getCurrentUser().subscribe({
            next: (res) => this.updateLoginState(res.data),
            error: () => this.state.next({ isLoggedIn: false })
        });
    }

    updateLoginState(profile: {
        fullname: string;
        email: string;
        profileImageUrl: string;
    }) {
        this.state.next({
        isLoggedIn: true,
        profile: {
            fullname: profile.fullname,
            email: profile.email,
            avatar: profile.profileImageUrl
        }
        });
    }

    clearSession() {
        this.state.next({ isLoggedIn: false });
    }
}