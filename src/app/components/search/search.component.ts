import { Component, OnInit } from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { Router } from '@angular/router';

import { DataService } from '@services/data.service';
import { NavigationPaths } from '@models/nav-enum.model';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
    public navigationPathEnum = NavigationPaths;

    searchInput: string | undefined;
    startAt = new Subject();
    endAt = new Subject();
    users: any;
    startAtObs = this.startAt.asObservable();
    endAtObs = this.endAt.asObservable();

    constructor(private dataService: DataService, private router: Router) {
    }

    ngOnInit(): void {
        // this.dataService.getUsers().subscribe(users => {
        //     console.log(users);
        // });

        combineLatest([this.startAtObs, this.endAtObs]).subscribe(value => {
            console.log(value);
            this.dataService.getUsers(value[0], value[1]).subscribe(data => {
                console.log(data);
                this.users = data;
            });
        });
    }

    onSearch(event: any): void {
        const SearchData = event.target.value;
        const searchData = SearchData.charAt(0).toUpperCase() + SearchData.slice(1);
        this.startAt.next(searchData);
        this.endAt.next(searchData + '\uf8ff');
    }

    goToUserProfile(userID: string): void {
        this.router.navigate([this.navigationPathEnum.ViewProfile, userID]);
        this.searchInput = '';
    }

}
