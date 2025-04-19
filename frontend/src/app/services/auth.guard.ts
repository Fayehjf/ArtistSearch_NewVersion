// import { Injectable } from '@angular/core';
// import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// import { AuthService } from './auth.service';

// @Injectable({ providedIn: 'root' })
// export class AuthGuard {
//     isLoggedIn = false;
    
//     constructor(
//         private authService: AuthService,
//         private router: Router
//     ) {}

//     canActivate(
//         route: ActivatedRouteSnapshot,
//         state: RouterStateSnapshot
//     ): boolean {
//             if (this.authService.isLoggedIn) {
//             return true;
//         } else {
//             this.router.navigate(['/login']);
//             return false;
//         }
//     }
// }