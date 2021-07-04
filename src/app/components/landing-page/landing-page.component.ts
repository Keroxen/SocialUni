import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { AuthDialogComponent } from '../auth-dialog/auth-dialog.component';
import { AuthService } from '@services/auth.service';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {

    constructor(private router: Router, public dialog: MatDialog, private authService: AuthService,
                private translate: TranslateService) {
    }

    ngOnInit(): void {
    }

    openDialog(authMode: string): void {
        this.dialog.open(AuthDialogComponent, {
            minHeight: '355px',
            minWidth: '40vw',
        });
        this.authService.updateAuthMode(authMode);
    }

    langEn(): void {
        this.translate.use('en');
        localStorage.setItem('language', 'en');
    }

    langRo(): void {
        this.translate.use('ro');
        localStorage.setItem('language', 'ro');
    }
}
