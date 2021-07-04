import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';

import { DataService } from '@services/data.service';
import { Post } from '@models/post.model';
import { NavigationPaths } from '@models/nav-enum.model';
import { SnackbarComponent } from '@shared/components/snackbar/snackbar.component';
import { AuthService } from '@services/auth.service';
import { ReactionsListComponent } from '@shared/components/reactions-list/reactions-list.component';

@Component({
    selector: 'app-view-post',
    templateUrl: './view-post.component.html',
    styleUrls: ['./view-post.component.scss']
})
export class ViewPostComponent implements OnInit {
    postID: string | undefined;
    post: Post | undefined = {} as Post | undefined;
    navigationPathEnum = NavigationPaths;
    deleteSnackbarText = 'Post deleted!';
    commentSnackbarText = 'New comment added!';
    saveSnackbarText = 'Post saved!';
    currentUid: string | undefined;
    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;
    userIsTeacher: boolean | undefined;
    areCommentsVisible = true;

    newCommentForm = new FormGroup({
        newComment: new FormControl('')
    });

    constructor(private route: ActivatedRoute, private dataService: DataService, private router: Router,
                private snackBar: MatSnackBar, private authService: AuthService, public dialog: MatDialog,
                private afs: AngularFirestore) {

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
        this.route.params.subscribe(params => {
            this.postID = params.id;
            console.log(params);
            this.afs.collection('posts').doc(params.id).valueChanges({idField: 'id'}).subscribe(post => {
                this.post = post as Post | undefined;
                console.log(this.post);
                this.areCommentsVisible = true;
                console.log(this.areCommentsVisible)
                this.dataService.getPostComments(this.postID).subscribe(comments => {
                    if (this.post) {
                        this.post.comments = comments;
                    }
                });
            });
        });
    }

    goToUserProfile(userID: string | undefined): void {
        this.router.navigate([this.navigationPathEnum.ViewProfile, userID]);
    }

    onDeletePost(postID: string | undefined): void {
        this.dataService.deletePost(postID);
        this.showSnackbar(this.deleteSnackbarText);
    }

    showSnackbar(snackbarText: string): void {
        this.snackBar.openFromComponent(SnackbarComponent, {
            data: snackbarText,
            duration: 1000
        });
    }

    onSavePost(postID: string | undefined): void {
        this.dataService.savePost(postID);
        this.showSnackbar(this.saveSnackbarText);
    }

    onOpenReactionsModal(postID: string | undefined, reactionType: string): void {
        this.dialog.open(ReactionsListComponent, {
            data: {
                postID,
                reactionType
            },
            height: 'fit-content',
            maxHeight: '90vh',
        });
    }

    onReactionClick(postID: string | undefined, reactionType: string): void {
        this.dataService.reactionClick(postID, reactionType, this.userFirstName, this.userLastName, this.userImageURL);
    }

    showHideComments(post: Post): void {
        this.areCommentsVisible = !this.areCommentsVisible;
        this.dataService.getPostComments(post.id).subscribe(comments => {
            post.comments = comments;
        });
    }

    onSubmitComment(postID: string | undefined): void {
        const comment = this.newCommentForm.get('newComment')?.value;
        this.dataService.submitComment(comment, postID, this.userFirstName, this.userLastName, this.userImageURL, this.userIsTeacher);
        this.newCommentForm.reset();
        this.showSnackbar(this.commentSnackbarText);
    }
}
