import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { NavigationPaths } from '@models/nav-enum.model';

@Component({
    selector: 'app-main-nav',
    templateUrl: './main-nav.component.html',
    styleUrls: ['./main-nav.component.scss'],
})
export class MainNavComponent implements OnInit {

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
        .pipe(
            map(result => result.matches),
            shareReplay()
        );

    public navigationPathEnum = NavigationPaths;
    closeDrawer = false;

    constructor(private breakpointObserver: BreakpointObserver, private authService: AuthService, private router: Router) {
    }

    onLogout(): void {
        this.authService.logout();
    }

    goTo(url: string): void {
        this.router.navigateByUrl(url);
    }

    ngOnInit() {
        this.isHandset$.subscribe(value => {
            this.closeDrawer = value;
        });
    }

}
