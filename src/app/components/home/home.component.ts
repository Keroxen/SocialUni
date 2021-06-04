import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '@services/data.service';
import { Post } from '@models/post.model';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

    latestPosts$: Observable<Post[]> | any;

    destroy$: Subject<boolean> = new Subject<boolean>();
    numberOfLikes = 123;
    numberOfDislikes = 54;

    newCommentForm = new FormGroup({
        newComment: new FormControl('')
    });

    constructor(private dataService: DataService) {
    }

    ngOnInit(): void {
        this.dataService.getPosts().pipe(take(1)).subscribe(data => {
            console.log(data);
            this.latestPosts$ = data;
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    showHideComments(post: Post): void {
        post.areCommentsVisible = !post.areCommentsVisible;
    }

}
