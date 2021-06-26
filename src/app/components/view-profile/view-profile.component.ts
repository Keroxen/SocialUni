import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '@services/data.service';
import { UserData } from '@models/userData.model';

@Component({
    selector: 'app-view-profile',
    templateUrl: './view-profile.component.html',
    styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent implements OnInit {
    userID: string | undefined;
    user: UserData | undefined = {} as UserData | undefined;

    constructor(private route: ActivatedRoute, private dataService: DataService) {
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.userID = params.id;
            this.dataService.getUserData(this.userID).ref.get().then((user: any) => {
                this.user = user?.data();
                console.log(this.user);
            });
        });
    }


}
