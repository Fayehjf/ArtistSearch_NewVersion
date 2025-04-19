import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment'; 

export interface RegisterPayload {
    fullname: string;
    email: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthResponse {
    data: {
      id: string;
      fullname: string;
      email: string;
      profileImageUrl: string;
    };
  }

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly apiPath = `${environment.backendUrl}/api/auth`;
    private currentUserSubject = new BehaviorSubject<AuthResponse['data'] | null>(null);
    private authStatusSubject = new BehaviorSubject<boolean>(false);

    currentUser$ = this.currentUserSubject.asObservable();
    isAuthenticated$ = this.authStatusSubject.asObservable();

    get isLoggedIn(): boolean {
        return this.authStatusSubject.value;
    }

    constructor(private http: HttpClient) { this.initializeAuthState(); }

    private initializeAuthState(): void {
        this.getCurrentUser().subscribe({
            next: (response) => {
                this.currentUserSubject.next(response.data);
                this.authStatusSubject.next(true);
            },
            error: () => this.clearSession()
        });
    }

    register(payload: RegisterPayload): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(
            `${this.apiPath}/register`, 
            payload,
            { withCredentials: true }
        ).pipe(
            tap(response => this.handleAuthSuccess(response.data))
        );
    }

  // auth.service.ts
// Login
login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiPath}/login`, payload, { withCredentials: true })
      .pipe(
        tap(response => {
          // Now response.data is { id, fullname, ... } directly
          this.handleAuthSuccess(response.data);
        })
      );
  }
  
  

    logout(): Observable<void> {
        return this.http.post<void>(
            `${this.apiPath}/logout`, 
            {},
            { withCredentials: true }
        ).pipe(
            tap(() => this.clearSession())
        );
    }

    deleteAccount(): Observable<void> {
            return this.http.delete<void>(
            `${this.apiPath}/delete`,
            { withCredentials: true }
        ).pipe(
            tap(() => this.clearSession())
        );
    }

    getCurrentUser(): Observable<AuthResponse> {
            return this.http.get<AuthResponse>(
            `${this.apiPath}/me`,
            { withCredentials: true }
        );
    }

    private handleAuthSuccess(user: AuthResponse['data']): void {
        // user is now { id, fullname, email, profileImageUrl }
        this.currentUserSubject.next(user);
        this.authStatusSubject.next(true);
      }

    private clearSession(): void {
        this.currentUserSubject.next(null);
        this.authStatusSubject.next(false);
    }
}