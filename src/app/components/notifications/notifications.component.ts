import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { DataService } from '@services/data.service';
import { Notifications } from '@models/notifications.model';
import { NavigationPaths } from '@models/nav-enum.model';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
    notifications: Observable<Notifications[]> | any;
    public navigationPathEnum = NavigationPaths;

    constructor(private dataService: DataService, private router: Router) {
    }

    ngOnInit(): void {
        this.dataService.getUserNotifications().subscribe(notifications => {
            this.notifications = notifications;
        });
    }

    goToPost(postId: string): void {
        console.log('to post');
        // this.router.navigate([this.navigationPathEnum.ViewPost, postId]);
    }

    goToUserProfile(userID: string): void {
        this.router.navigate([this.navigationPathEnum.ViewProfile, userID]);
    }

}
