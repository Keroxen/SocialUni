// import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
// import { AuthService } from '@services/auth.service';
// import { Observable } from 'rxjs';
// import { map, take } from 'rxjs/operators';
// import { Injectable } from '@angular/core';
//
// @Injectable()
// export class AuthGuard implements CanActivate {
//     constructor(private authService: AuthService, private router: Router) {
//     }
//
//     canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): | boolean | UrlTree | Promise<boolean | UrlTree>
//         | Observable<boolean | UrlTree> {
//         return this.authService.user.pipe(take(1), map(user => {
//             const isAuth = !!user;
//             if (isAuth) {
//                 return true;
//             }
//             return this.router.createUrlTree(['/landing-page']);
//         }));
//     }
// }
