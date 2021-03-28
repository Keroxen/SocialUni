import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthResponseData } from '../../shared/auth.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
    isLoginMode = false;
    error = null;

    constructor(private authService: AuthService, private router: Router) {
    }

    authForm = new FormGroup({
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        email: new FormControl(''),
        password: new FormControl(''),
    });

    ngOnInit(): void {
        setTimeout(() => {
            this.authService.logout();
        }, 10000)
    }

    onSubmit() {
        console.log(this.authForm.value);
        if (!this.authForm.valid) {
            return;
        }

        const email = this.authForm.value.email;
        const password = this.authForm.value.password;
        console.log(this.authForm.valid)
        let authObs: Observable<AuthResponseData>;

        // if (this.isLoginMode) {
            authObs = this.authService.login(email, password);
        // } else {
        //     authObs = this.authService.signup(email, password);
        // }

        authObs.subscribe(resData => {
            console.log(resData);
            this.router.navigate(['/']);
        }, errorMessage => {
            console.log(errorMessage);
            this.error = errorMessage;
        });

        this.authForm.reset();
    }
}
