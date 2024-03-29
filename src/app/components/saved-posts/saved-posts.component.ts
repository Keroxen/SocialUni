import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';

import { Post } from '@models/post.model';
import { DataService } from '@services/data.service';
import { SnackbarComponent } from '@shared/components/snackbar/snackbar.component';
import { AuthService } from '@services/auth.service';

@Component({
    selector: 'app-saved-posts',
    templateUrl: './saved-posts.component.html',
    styleUrls: ['./saved-posts.component.scss']
})
export class SavedPostsComponent implements OnInit {
    savedPosts: Observable<Post[]> | any;
    currentUid: string | undefined;
    deleteSnackbarText = 'Post deleted!';
    commentSnackbarText = 'New comment added!';
    saveSnackbarText = 'Post saved!';
    savedPostsArray: any = [];
    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;
    userIsTeacher: boolean | undefined;

    newCommentForm = new FormGroup({
        newComment: new FormControl('')
    });

    constructor(private dataService: DataService, private afs: AngularFirestore, private authService: AuthService,
                private snackBar: MatSnackBar) {
        this.currentUid = this.authService.currentUid;
        this.dataService.getUserData(this.currentUid).ref.get().then(doc => {
            const userData = doc.data();
            this.userFirstName = userData?.firstName;
            this.userLastName = userData?.lastName;
            this.userImageURL = userData?.imageURL;
            this.userIsTeacher = userData?.isTeacher;
        });
    }

    ngOnInit(): void {
        this.getSavedPosts();
    }

    getSavedPosts(): void {
        this.dataService.getSavedPosts().get().toPromise().then(doc => {
            doc.data()?.savedPosts?.forEach((docID: string, i: number) => {
                this.afs.collection('posts', posts => posts.orderBy('created', 'desc')).doc(docID).ref.get().then(data => {
                    this.savedPostsArray.push(data.data());
                    this.savedPostsArray[i].id = docID;
                    console.log(this.savedPostsArray);
                });
            });
        });
    }

    showHideComments(post: Post): void {
        post.areCommentsVisible = !post.areCommentsVisible;
        this.dataService.getPostComments(post.id).subscribe(comments => {
            post.comments = comments;
        });
    }

    onSubmitComment(postID: string): void {
        const comment = this.newCommentForm.get('newComment')?.value;
        this.dataService.submitComment(comment, postID, this.userFirstName, this.userLastName, this.userImageURL, this.userIsTeacher);
        this.newCommentForm.reset();
        this.showSnackbar(this.commentSnackbarText);
    }

    onReactionClick(postID: string, type: string, i: number): void {
        this.dataService.reactionClick(postID, type, this.userFirstName, this.userLastName, this.userImageURL);
        this.afs.collection<Post>('posts').doc(postID).ref.get().then(value => {
            const docData = value.data();
            this.savedPostsArray[i].numberOfLikes = docData?.numberOfLikes;
            this.savedPostsArray[i].numberOfDislikes = docData?.numberOfDislikes;
        });
    }

    onDeletePost(postID: string, i: number): void {
        this.dataService.deletePost(postID).then(r => {
            this.onRemoveSavedPost(postID, i);
        });
        this.showSnackbar(this.deleteSnackbarText);
    }

    onSavePost(postID: string): void {
        this.dataService.savePost(postID);
        this.showSnackbar(this.saveSnackbarText);
    }

    onRemoveSavedPost(postID: string, i: number): void {
        this.dataService.removeSavedPost(postID).then(r => {
            this.getSavedPosts();
            this.savedPostsArray.splice(i, 1);
            console.log(this.savedPostsArray);
        });
    }

    showSnackbar(snackbarText: string): void {
        this.snackBar.openFromComponent(SnackbarComponent, {
            data: snackbarText,
            duration: 1000
        });
    }

}
