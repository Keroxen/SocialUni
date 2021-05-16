import { Component, OnInit } from '@angular/core';
import { DataService } from '@services/data.service';
import { Post } from '@models/post.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    latestPosts: Post[] = [];
    destroy$: Subject<boolean> = new Subject<boolean>();
    numberOfLikes = 123;
    numberOfDislikes = 54;

    constructor(private dataService: DataService) {
    }

    ngOnInit(): void {
        this.dataService.getPosts().pipe(takeUntil(this.destroy$)).subscribe(data => {
            console.log(data);
            console.log(data[0].created);
            this.latestPosts = data;
        });
    }

}
