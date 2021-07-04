import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';

import { AuthService } from '@services/auth.service';
import { NavigationPaths } from '@models/nav-enum.model';
import { MessagingService } from '@services/messaging.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'SocialUni';
    public navigationPathEnum = NavigationPaths;

    constructor(private router: Router, public authService: AuthService,
                public msgService: MessagingService, private afAuth: AngularFireAuth, private translate: TranslateService) {
        translate.setDefaultLang('en');
        const lsLang = localStorage.getItem('language');
        if (lsLang) {
            translate.use(lsLang);
        } else {
            translate.use('en');
        }
    }

    ngOnInit(): void {
        if (this.authService.isLoggedIn) {
            this.router.navigateByUrl(this.navigationPathEnum.Home);

            this.afAuth.user.pipe(take(1)).subscribe(user => {
                console.log(user);
                console.log('in token');
                this.msgService.getPermission(user);
                this.msgService.receiveMessage();
            });
        }
    }
}
