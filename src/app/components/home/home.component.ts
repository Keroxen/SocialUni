import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import firebase from 'firebase';

import { DataService } from '@services/data.service';
import { Post } from '@models/post.model';
import { AuthService } from '@services/auth.service';
import { SnackbarComponent } from '@shared/components/snackbar/snackbar.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    currentUid: string | undefined;
    destroy$: Subject<boolean> = new Subject<boolean>();
    latestPosts: Observable<Post[]> | any;
    postsCollection = this.afs.collection<Post>('posts');

    newCommentForm = new FormGroup({
        newComment: new FormControl('')
    });

    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;
    deleteSnackbarText = 'Post deleted!';
    commentSnackbarText = 'New comment added!';
    saveSnackbarText = 'Post saved!';

    increment = firebase.firestore.FieldValue.increment(1);
    decrement = firebase.firestore.FieldValue.increment(-1);

    constructor(private dataService: DataService, private afs: AngularFirestore, private authService: AuthService,
                private snackBar: MatSnackBar) {
        this.currentUid = this.authService.currentUid;
        this.dataService.getUserData(this.currentUid).ref.get().then(doc => {
            this.userFirstName = doc.data()?.firstName;
            this.userLastName = doc.data()?.lastName;
            this.userImageURL = doc.data()?.imageURL;
        });
    }

    ngOnInit(): void {
        this.dataService.getPosts().subscribe(posts => {
            this.latestPosts = posts;
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    showHideComments(post: Post): void {
        // TODO
        const postRef = this.postsCollection.doc(post.id);

        // postRef.get().subscribe()

        // if (!post.areCommentsVisible) {
        post.areCommentsVisible = !post.areCommentsVisible;
        this.dataService.getPostComments(post.id).subscribe(comments => {
            post.comments = comments;
            //     console.log('here');
            //     console.log(post.areCommentsVisible);
            //     if (post.areCommentsVisible) {
            //     } else {
            //         postRef.update({
            //             areCommentsVisible: true
            //         });
            //     }
        });
        // this.updateShowHideCommentsField(post);
        // postRef.update({
        //     areCommentsVisible: post.areCommentsVisible
        // });
        // } else {
        //     post.areCommentsVisible = false;
        // }
    }

    updateShowHideCommentsField(post: Post): void {
        this.postsCollection.doc(post.id).update({
            areCommentsVisible: post.areCommentsVisible
        });
    }

    onSubmitComment(postID: string): void {
        const comment = this.newCommentForm.get('newComment')?.value;
        this.dataService.submitComment(comment, postID, this.userFirstName, this.userLastName, this.userImageURL);
        this.newCommentForm.reset();
        this.showSnackbar(this.commentSnackbarText);
    }

    onReactionClick(postID: string, type: string): void {
        this.dataService.reactionClick(postID, type, this.userFirstName, this.userLastName, this.userImageURL);
    }

    onDeletePost(postID: string): void {
        this.dataService.deletePost(postID);
        this.showSnackbar(this.deleteSnackbarText);
    }

    onSavePost(postID: string): void {
        this.dataService.savePost(postID);
        this.showSnackbar(this.saveSnackbarText);
    }

    showSnackbar(snackbarText: string): void {
        this.snackBar.openFromComponent(SnackbarComponent, {
            data: snackbarText,
            duration: 1000
        });
    }

}
