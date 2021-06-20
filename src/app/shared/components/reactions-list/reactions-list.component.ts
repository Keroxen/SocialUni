import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DataService } from '@services/data.service';

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

    constructor(@Inject(MAT_DIALOG_DATA) public data: { postID: string, reactionType: string },
                private dataService: DataService) {
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
}
