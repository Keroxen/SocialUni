import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';

import { DataService } from '@services/data.service';
import { Post } from '@models/post.model';
import { Comment } from '@models/comment.model';
import { AuthService } from '@services/auth.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    currentUid: string | undefined;

    latestPosts$: Observable<Post[]> | any;

    destroy$: Subject<boolean> = new Subject<boolean>();
    numberOfLikes = 123;
    numberOfDislikes = 54;

    newCommentForm = new FormGroup({
        newComment: new FormControl('')
    });

    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;

    constructor(private dataService: DataService, private afs: AngularFirestore, private authService: AuthService,
                private afAuth: AngularFireAuth) {
        this.afAuth.authState.pipe(takeUntil(this.destroy$)).subscribe(user => {
            this.currentUid = user?.uid;
            this.dataService.getUserData(this.currentUid).ref.get().then(doc => {
                console.log(doc.data());
                this.userFirstName = doc.data()?.firstName;
                this.userLastName = doc.data()?.lastName;
                this.userImageURL = doc.data()?.imageURL;
            });
        });
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

    onSubmitComment(postId: string): void {
        console.log(this.newCommentForm.get('newComment')?.value);
        console.log(postId);
        const newComment = this.newCommentForm.get('newComment')?.value;
        if (newComment && newComment.trim()) {
            this.afs.collection<Post>('posts').doc(postId).collection<Comment>('comments').add({
                content: newComment,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                userFirstName: this.userFirstName,
                userLastName: this.userLastName,
                userImageURL: this.userImageURL,
            });
            this.newCommentForm.reset();
        } else {
            console.log('empty post');
        }
    }
}
