import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthDialogComponent } from '../auth-dialog/auth-dialog.component';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {

    constructor(private router: Router, public dialog: MatDialog, private authService: AuthService) {
    }

    ngOnInit(): void {
    }

    openDialog(authMode: string) {
        const dialogRef = this.dialog.open(AuthDialogComponent);
        this.authService.updateAuthMode(authMode);
        dialogRef.afterClosed().subscribe(result => {
            // console.log(result);
        });
    }
}
