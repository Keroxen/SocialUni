import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthResponseData } from '../../shared/auth.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-auth-dialog',
    templateUrl: './auth-dialog.component.html',
    styleUrls: ['./auth-dialog.component.scss']
})
export class AuthDialogComponent implements OnInit, OnDestroy {

    constructor(private authService: AuthService, private router: Router) {
    }

    authModeSubscription: Subscription | undefined;
    authMode: string | null = '';
    error = null;

    authForm = new FormGroup({
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        email: new FormControl(''),
        password: new FormControl(''),
        // university: new FormControl(''),
    });

    ngOnInit(): void {
        this.authModeSubscription = this.authService.authMode$.subscribe(data => {
            // console.log(data);
            this.authMode = data;
        });
    }

    onSubmit(): void {
        console.log(this.authForm.value);
        if (!this.authForm.valid) {
            return;
        }
        const email = this.authForm.value.email;
        const password = this.authForm.value.password;
        console.log(this.authForm.valid);
        let authObs: Observable<AuthResponseData>;

        if (this.authMode === 'login') {
            authObs = this.authService.login(email, password);
            authObs.subscribe(resData => {
                console.log(resData);
                this.router.navigate(['/home']);
            }, errorMessage => {
                console.log(errorMessage);
                this.error = errorMessage;
            });

        } else if (this.authMode === 'signup') {
            authObs = this.authService.signup(email, password);
            authObs.subscribe(resData => {
                console.log(resData);
                this.router.navigate(['/home']);
            }, errorMessage => {
                console.log(errorMessage);
                this.error = errorMessage;
            });
        }

        this.authForm.reset();
    }

    ngOnDestroy(): void {
        if (this.authModeSubscription) {
            this.authModeSubscription.unsubscribe();
        }
    }
}
