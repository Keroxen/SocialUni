import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import firebase from 'firebase';

import { DataService } from '@services/data.service';
import { Post } from '@models/post.model';
import { AuthService } from '@services/auth.service';
import { SnackbarComponent } from '@shared/components/snackbar/snackbar.component';
import { ReactionsListComponent } from '@shared/components/reactions-list/reactions-list.component';
import { NavigationPaths } from '@models/nav-enum.model';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    currentUid: string | undefined;
    destroy$: Subject<boolean> = new Subject<boolean>();
    navigationPathEnum = NavigationPaths;

    latestPosts: Observable<Post[]> | any;
    postsCollection = this.afs.collection<Post>('posts');

    newCommentForm = new FormGroup({
        newComment: new FormControl('')
    });

    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;
    userIsTeacher: boolean | undefined;
    deleteSnackbarText = 'Post deleted!';
    commentSnackbarText = 'New comment added!';
    saveSnackbarText = 'Post saved!';

    increment = firebase.firestore.FieldValue.increment(1);
    decrement = firebase.firestore.FieldValue.increment(-1);

    constructor(private dataService: DataService, private afs: AngularFirestore, private authService: AuthService,
                private snackBar: MatSnackBar, public dialog: MatDialog, private router: Router) {
        this.currentUid = this.authService.currentUid;
        this.dataService.getUserData(this.currentUid).ref.get().then((doc: any) => {
            const userData = doc.data();
            this.userFirstName = userData.firstName;
            this.userLastName = userData.lastName;
            this.userImageURL = userData.imageURL;
            this.userIsTeacher = userData.isTeacher;
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
        this.dataService.submitComment(comment, postID, this.userFirstName, this.userLastName, this.userImageURL, this.userIsTeacher);
        this.newCommentForm.reset();
        this.showSnackbar(this.commentSnackbarText);
    }

    onReactionClick(postID: string, reactionType: string): void {
        this.dataService.reactionClick(postID, reactionType, this.userFirstName, this.userLastName, this.userImageURL);
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

    onOpenReactionsModal(postID: string, reactionType: string): void {
        this.dialog.open(ReactionsListComponent, {
            data: {
                postID,
                reactionType
            },
            height: 'fit-content',
            maxHeight: '90vh',
            // minHeight: 'auto !important',
            // width: 'auto'
        });
    }

    goToUerProfile(userID: string): void {
        this.router.navigate([this.navigationPathEnum.ViewProfile, userID]);
    }

}
