import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';

import { AuthService } from '@services/auth.service';
import { NavigationPaths } from '@models/nav-enum.model';
import { MessagingService } from '@services/messaging.service';

@Component({
    selector: 'app-main-nav',
    templateUrl: './main-nav.component.html',
    styleUrls: ['./main-nav.component.scss'],
})
export class MainNavComponent implements OnInit {

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
        .pipe(
            map(result => result.matches),
            shareReplay()
        );

    public navigationPathEnum = NavigationPaths;
    closeDrawer = false;

    @ViewChild(ToastContainerDirective, {static: true})
    toastContainer: ToastContainerDirective | undefined;

    constructor(private breakpointObserver: BreakpointObserver, public authService: AuthService,
                private router: Router, private toastrService: ToastrService,
                public msgService: MessagingService) {
    }

    onLogout(): void {
        this.authService.logOut();
    }

    goTo(url: string): void {
        this.router.navigateByUrl(url);
    }

    ngOnInit(): void {
        this.isHandset$.subscribe(value => {
            this.closeDrawer = value;
        });

        this.toastrService.overlayContainer = this.toastContainer;

        this.msgService.currentMessage.subscribe(notification => {
            console.log(notification.data.uid)
            console.log(this.authService.currentUid)
            if (this.authService.currentUid === notification.data.uid) {
                this.toastrService.show(`
                <p class="notification-title">New comment to your post</p>
                <div class="image-and-details">
                    <div class="profile-img-wrapper">
                        <img class="profile-img" src="${notification.data.userImg}" alt="Profile Image">
                    </div>
                    <div class="post-details">
                        <div class="post-author">${notification.data.userFirstName} ${notification.data.userLastName}
                        </div>
                    </div>
                </div>`
                    ,
                    '', {
                        enableHtml: true,
                        timeOut: 0,
                        extendedTimeOut: 0,
                        tapToDismiss: true, // TODO true later
                    })
                    .onTap
                    .pipe(take(1))
                    .subscribe(() => this.toastrGoToPost(notification.data.postId));
            }
        });
    }

    toastrGoToPost(postId: string): void {
        console.log(postId);
        console.log('toaster clicked');
    }

}
