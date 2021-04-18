import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthResponseData } from '@models/auth.model';
import { Router } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { University } from '@models/university.model';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-auth-dialog',
    templateUrl: './auth-dialog.component.html',
    styleUrls: ['./auth-dialog.component.scss']
})
export class AuthDialogComponent implements OnInit, OnDestroy {

    constructor(private authService: AuthService, private router: Router, private dialogRef: MatDialogRef<AuthDialogComponent>) {
    }

    authModeSubscription: Subscription | undefined;
    authMode: string | null = '';
    error = null;
    today: Date | undefined;

    signupForm = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        dob: new FormControl('', Validators.required),
        email: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
        university: new FormControl('', Validators.required),
        accessCode: new FormControl('', Validators.required),
    });

    loginForm = new FormGroup({
        email: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required)
    });

    filteredUniversities: Observable<University[]> | undefined;
    universities: University[] | undefined;
    universitiesSubscription: Subscription | undefined;

    ngOnInit(): void {
        this.authModeSubscription = this.authService.authMode$.subscribe(data => {
            this.authMode = data;
        });
        if (this.authMode === 'signup') {
            this.universitiesSubscription = this.authService.getUniversities().subscribe(data => {
                this.universities = data;
                // console.log(this.universities);
                this.filteredUniversities = this.signupForm.get('university')?.valueChanges
                    .pipe(
                        startWith(''),
                        map(value => this._filter(value))
                    );
            });
            this.today = new Date();
        }
    }

    private _filter(value: string): University[] {
        if (this.universities) {
            const filterValue = value.toLowerCase();
            return this.universities.filter(option => option.name.toLowerCase().includes(filterValue));
        } else {
            return [];
        }
    }

    onSignup(): void {
        if (!this.signupForm.valid) {
            return;
        }

        console.log(this.signupForm.valid);

        let authObs: Observable<AuthResponseData>;

        const firstName = this.signupForm.value.firstName;
        const lastName = this.signupForm.value.lastName;
        const dob = this.signupForm.value.dob;
        const email = this.signupForm.value.email;
        const password = this.signupForm.value.password;
        const university = this.signupForm.value.university;
        const accessCode = this.signupForm.value.accessCode;

        if (accessCode === '1234') {
            authObs = this.authService.signup(email, password);
            authObs.subscribe(resData => {
                console.log(resData);
                this.router.navigate(['/home']);
            }, errorMessage => {
                console.log(errorMessage);
                this.error = errorMessage;
            });
            this.dialogRef.close();
            this.signupForm.reset();
            this.authService.saveUser(firstName, lastName, dob, email, university, accessCode);
        } else {
            console.log('invalid code');
        }
    }

    onLogin(): void {
        if (!this.loginForm.valid) {
            return;
        }

        let authObs: Observable<AuthResponseData>;

        const email = this.loginForm.value.email;
        const password = this.loginForm.value.password;

        authObs = this.authService.login(email, password);
        authObs.subscribe(resData => {
            console.log(resData);
            this.router.navigate(['/home']);
        }, errorMessage => {
            console.log(errorMessage);
            this.error = errorMessage;
        });
        this.dialogRef.close();
        this.loginForm.reset();
    }

    ngOnDestroy(): void {
        this.authModeSubscription?.unsubscribe();
        this.universitiesSubscription?.unsubscribe();
    }
}
