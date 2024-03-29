import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DataService } from '@services/data.service';
import { Router } from '@angular/router';
import { NavigationPaths } from '@models/nav-enum.model';

@Component({
    selector: 'app-reactions-list',
    templateUrl: './reactions-list.component.html',
    styleUrls: ['./reactions-list.component.scss']
})
export class ReactionsListComponent implements OnInit {
    pageNumber = 1;
    postID: string | undefined;
    reactionType: string | undefined;
    usersList: any[] = [];
    public navigationPathEnum = NavigationPaths;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { postID: string, reactionType: string },
                private dataService: DataService, private router: Router) {
    }

    ngOnInit(): void {
        this.postID = this.data.postID;
        this.reactionType = this.data.reactionType;
        console.log(this.data.postID);
        console.log(this.data.reactionType);
        this.dataService.getReactionsList(this.postID, this.reactionType).subscribe(data => {
            this.usersList = data;
            console.log(data);
        });

    }

    goToUserProfile(userID: string): void {
        this.router.navigate([this.navigationPathEnum.ViewProfile, userID]);
    }
}
