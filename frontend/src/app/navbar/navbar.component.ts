import { Component, OnDestroy, OnInit,ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService,AuthResponse } from '../services/auth.service';
import { Subscription,Observable } from 'rxjs';
import { NotificationService } from '../services/notification.service';
interface UserProfile {
    displayName: string;
    avatarUrl: string;
}

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    encapsulation: ViewEncapsulation.None  
})
export class NavbarComponent implements OnInit, OnDestroy {
    private authSub?: Subscription;
    currentUser?: UserProfile;
    authChecked = false;
    isMobileMenuOpen = false;

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }

    constructor(
        public authHandler: AuthService,
        private routeHandler: Router,
        private notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        this.authSub = this.authHandler.currentUser$.subscribe(user => {
            if (user) {
              // user.fullname is valid now
              this.currentUser = {
                displayName: user.fullname,
                avatarUrl: user.profileImageUrl
              };
            } else {
              this.currentUser = undefined;
            }
        
          this.authChecked = true;
        });
      }

    ngOnDestroy(): void {
        this.authSub?.unsubscribe();
    }
    updateUser(user: AuthService['currentUser$'] extends Observable<any> ? any : never): void {
        if (user) {
          // Map the backend property names to your navbar's expected names
          this.currentUser = {
            displayName: user.fullname,
            avatarUrl: user.profileImageUrl
          };
        } else {
          this.currentUser = undefined;
        }
      }

    private initAuthMonitoring(): void {
        this.authSub = this.authHandler.getCurrentUser().subscribe({
            next: (res) => this.handleAuthUpdate(res.data),
            error: () => this.handleAuthClear()
        });
    }

    private handleAuthUpdate(data: any): void {
        // If data has { user: {...} }, then destructure that
        const userObj = data?.user;  
        if (!userObj) {
          this.currentUser = undefined;
          return;
        }
      
        console.log('Gravatar data:', userObj.profileImageUrl);
        this.currentUser = {
          displayName: userObj.fullname,
          avatarUrl: userObj.profileImageUrl
        };
        this.authChecked = true;
      }

    private handleAuthClear(): void {
        this.currentUser = undefined;
        this.authChecked = true;
    }

    initiateSignOut(): void {
      this.authHandler.logout().subscribe({
        complete: () => {
          localStorage.removeItem('selectedArtist');
          localStorage.removeItem('uiState');
          this.notificationService.showNotification('danger', 'Logged out successfully!');
          this.postLogoutActions();
        }
      });
    }

    requestAccountRemoval(): void {
      if (confirm('Permanently remove your account and all data?')) {
        this.authHandler.deleteAccount().subscribe({
          complete: () => {
            this.notificationService.showNotification('danger', 'Account deleted successfully.');
            this.postLogoutActions();
          },
          error: (err) => {
            this.notificationService.showNotification('error', 'Account removal failed.');
            console.error('Account removal failed:', err);
          }
            });
        }
    }

    private postLogoutActions(): void {
        this.currentUser = undefined;
        this.routeHandler.navigate(['/discover']);
    }
    private onLogout(): void {
        // On logout clear current user and navigate; the BehaviorSubject will update automatically.
        this.routeHandler.navigate(['/discover']);
      }
    
}
