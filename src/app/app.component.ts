import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'licenta';

    constructor(private router: Router, public authService: AuthService) {
    }

    ngOnInit(): void {
        // this.authService.autoLogin();
        if (this.authService.isLoggedIn) {
            this.router.navigateByUrl('/home');
        }
    }
}
