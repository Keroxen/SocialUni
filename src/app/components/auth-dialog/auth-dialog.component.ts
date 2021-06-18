import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';

import { AuthService } from '@services/auth.service';
import { University } from '@models/university.model';

@Component({
    selector: 'app-auth-dialog',
    templateUrl: './auth-dialog.component.html',
    styleUrls: ['./auth-dialog.component.scss']
})
export class AuthDialogComponent implements OnInit, OnDestroy {
    destroy$: Subject<boolean> = new Subject<boolean>();
    authMode: string | null = '';
    today: Date | undefined;

    signupForm = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        dob: new FormControl('', Validators.required),
        email: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
        university: new FormControl('', Validators.required),
        accessCode: new FormControl('', Validators.required),
        isTeacher: new FormControl(false)
    });

    loginForm = new FormGroup({
        email: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required)
    });

    filteredUniversities: Observable<University[]> | undefined;
    universities: University[] | undefined;

    constructor(private authService: AuthService, private router: Router, private dialogRef: MatDialogRef<AuthDialogComponent>) {
    }


    ngOnInit(): void {
        this.authService.authMode$.pipe(takeUntil(this.destroy$)).subscribe(data => {
            this.authMode = data;
        });
        if (this.authMode === 'signup') {
            this.authService.getUniversities().pipe(takeUntil(this.destroy$)).subscribe(data => {
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

        console.log(this.signupForm.valid);

        const firstName = this.signupForm.value.firstName;
        const lastName = this.signupForm.value.lastName;
        const dob = this.signupForm.value.dob;
        const email = this.signupForm.value.email;
        const password = this.signupForm.value.password;
        const university = this.signupForm.value.university;
        const accessCode = this.signupForm.value.accessCode;
        const isTeacher = this.signupForm.value.isTeacher;

        if (accessCode === '1234') {
            this.authService.signUp(email, password, firstName, lastName, dob, university, accessCode, isTeacher);
            this.dialogRef.close();
        } else {
            console.log('invalid code');
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
