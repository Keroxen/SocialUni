import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';

import { AuthService } from '@services/auth.service';
import { University } from '@models/university.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-auth-dialog',
    templateUrl: './auth-dialog.component.html',
    styleUrls: ['./auth-dialog.component.scss']
})
export class AuthDialogComponent implements OnInit, OnDestroy {
    destroy$: Subject<boolean> = new Subject<boolean>();
    authMode: string | null = '';
    today: Date | undefined;
    loginMessage = '';
    signupMessage = '';
    loginBtnMessage = '';
    signupBtnMessage = '';

    signupForm = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        dob: new FormControl('', Validators.required),
        email: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
        university: new FormControl('', Validators.required),
        accessCode: new FormControl('', Validators.required),
        isTeacher: new FormControl(false),
        agreedPolicy: new FormControl(false, Validators.requiredTrue)
    });

    loginForm = new FormGroup({
        email: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required)
    });

    filteredUniversities: Observable<University[]> | undefined;
    universities: University[] | undefined;

    constructor(private authService: AuthService, private router: Router, private dialogRef: MatDialogRef<AuthDialogComponent>,
                public translate: TranslateService) {
    }


    ngOnInit(): void {
        this.authService.authMode$.pipe(takeUntil(this.destroy$)).subscribe(data => {
            this.authMode = data;
        });
        if (this.authMode === 'signup') {
            this.authService.getUniversities().pipe(takeUntil(this.destroy$)).subscribe(data => {
                this.universities = data;
                this.filteredUniversities = this.signupForm.get('university')?.valueChanges
                    .pipe(
                        startWith(''),
                        map(value => this._filter(value))
                    );
            });
            this.today = new Date();
        }
        this.loginMessage = this.translate.instant('login');
        this.signupMessage = this.translate.instant('signup');
        this.loginBtnMessage = this.translate.instant('logIn');
        this.signupBtnMessage = this.translate.instant('signUp');
    }

    private _filter(value: string): University[] {
        if (this.universities) {
            const filterValue = value?.toLowerCase();
            return this.universities.filter(option => option.name.toLowerCase().includes(filterValue));
        } else {
            return [];
        }
    }

    onSignup(): void {
        if (!this.signupForm.valid) {
            return;
        }

        const FirstName = this.signupForm.value.firstName;
        const LastName = this.signupForm.value.lastName;
        const firstName = FirstName.charAt(0).toUpperCase() + FirstName.slice(1);
        const lastName = LastName.charAt(0).toUpperCase() + LastName.slice(1);
        const dob = this.signupForm.value.dob;
        const email = this.signupForm.value.email;
        const password = this.signupForm.value.password;
        const university = this.signupForm.value.university;
        const accessCode = this.signupForm.value.accessCode;
        const isTeacher = this.signupForm.value.isTeacher;
        const agreedPolicy = this.signupForm.value.agreedPolicy;

        if (accessCode === '1234' && agreedPolicy) {
            this.authService.signUp(email, password, firstName, lastName, dob, university, accessCode, isTeacher);
            this.dialogRef.close();
        }
    }

    onLogin(): void {
        if (!this.loginForm.valid) {
            return;
        }
        const email = this.loginForm.value.email;
        const password = this.loginForm.value.password;

        this.authService.logIn(email, password);
        this.dialogRef.close();
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
