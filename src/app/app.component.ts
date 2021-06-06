import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@services/auth.service';
import { NavigationPaths } from '@models/nav-enum.model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'licenta';
    public navigationPathEnum = NavigationPaths;

    constructor(private router: Router, public authService: AuthService) {
    }

    ngOnInit(): void {
        if (this.authService.isLoggedIn) {
            this.router.navigateByUrl(this.navigationPathEnum.Home);
        }
    }
}
