import { Component, OnInit } from '@angular/core';
import { DataService } from '@services/data.service';
import { Post } from '@models/post.model';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    latestPosts: Post[] = [];

    constructor(private dataService: DataService) {
    }

    ngOnInit(): void {
        this.dataService.getPosts().subscribe(data => {
            console.log(data);
            this.latestPosts = data;
        });
    }

}
