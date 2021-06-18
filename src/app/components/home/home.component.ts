import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';

import { DataService } from '@services/data.service';
import { Post } from '@models/post.model';
import { Comment } from '@models/comment.model';
import { AuthService } from '@services/auth.service';
import { LikeDislike } from '@models/likeDislike.model';
import { SnackbarComponent } from '@shared/components/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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

    increment = firebase.firestore.FieldValue.increment(1);
    decrement = firebase.firestore.FieldValue.increment(-1);

    constructor(private dataService: DataService, private afs: AngularFirestore, private authService: AuthService,
                private afAuth: AngularFireAuth, private snackBar: MatSnackBar) {
        this.afAuth.authState.pipe(takeUntil(this.destroy$)).subscribe(user => {
            this.currentUid = user?.uid;
            this.dataService.getUserData(this.currentUid).ref.get().then(doc => {
                this.userFirstName = doc.data()?.firstName;
                this.userLastName = doc.data()?.lastName;
                this.userImageURL = doc.data()?.imageURL;
            });
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
        console.log(this.newCommentForm.get('newComment')?.value);
        const postDoc = this.postsCollection.doc(postID);
        const newComment = this.newCommentForm.get('newComment')?.value;
        if (newComment && newComment.trim()) {
            postDoc.collection<Comment>('comments').add({
                content: newComment,
                uid: this.currentUid,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                userFirstName: this.userFirstName,
                userLastName: this.userLastName,
                userImageURL: this.userImageURL,
            });
            // postDoc.update({
            //     numberOfComments: this.increment
            // });
            this.newCommentForm.reset();
            this.showSnackbar(this.commentSnackbarText);
        } else {
            console.log('empty post');
        }
    }

    onReactionClick(postID: string, type: string): void {
        const likesCollectionRef = this.postsCollection.doc(postID).collection<LikeDislike>('likes',
            likes => likes.where('uid', '==', this.currentUid));
        const dislikesCollectionRef = this.postsCollection.doc(postID).collection<LikeDislike>('dislikes',
            likes => likes.where('uid', '==', this.currentUid));
        const reactionsRef = this.postsCollection.doc(postID);

        if (type === 'like') {
            likesCollectionRef.get().toPromise().then(querySnapshot => {
                if (querySnapshot.docs.length > 0) {
                    querySnapshot.forEach(doc => {
                        doc.ref.delete();
                        reactionsRef.update({
                            numberOfLikes: this.decrement
                        });
                    });
                } else {
                    reactionsRef.update({
                        numberOfLikes: this.increment
                    });
                    likesCollectionRef.add({
                        uid: this.currentUid,
                        created: firebase.firestore.FieldValue.serverTimestamp(),
                        userFirstName: this.userFirstName,
                        userLastName: this.userLastName,
                        userImageURL: this.userImageURL,
                    });
                }
            });

            dislikesCollectionRef.get().toPromise().then(querySnapshot => {
                if (querySnapshot.docs.length > 0) {
                    querySnapshot.forEach(doc => {
                        doc.ref.delete();
                        reactionsRef.update({
                            numberOfDislikes: this.decrement
                        });
                    });
                }
            });
        } else if (type === 'dislike') {
            dislikesCollectionRef.get().toPromise().then(querySnapshot => {
                if (querySnapshot.docs.length > 0) {
                    querySnapshot.forEach(doc => {
                        doc.ref.delete();
                        reactionsRef.update({
                            numberOfDislikes: this.decrement
                        });
                    });
                } else {
                    reactionsRef.update({
                        numberOfDislikes: this.increment
                    });
                    dislikesCollectionRef.add({
                        uid: this.currentUid,
                        created: firebase.firestore.FieldValue.serverTimestamp(),
                        userFirstName: this.userFirstName,
                        userLastName: this.userLastName,
                        userImageURL: this.userImageURL,
                    });
                }
            });

            likesCollectionRef.get().toPromise().then(querySnapshot => {
                if (querySnapshot.docs.length > 0) {
                    querySnapshot.forEach(doc => {
                        doc.ref.delete();
                        reactionsRef.update({
                            numberOfLikes: this.decrement
                        });
                    });
                }
            });
        }
    }

    onDeletePost(postID: string): void {
        this.postsCollection.doc(postID).delete();
        this.showSnackbar(this.deleteSnackbarText);
    }

    showSnackbar(snackbarText: string): void {
        this.snackBar.openFromComponent(SnackbarComponent, {
            data: snackbarText,
            duration: 1000
        });
    }

}
