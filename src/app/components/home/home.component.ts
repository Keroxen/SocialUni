import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';

import { DataService } from '@services/data.service';
import { Post } from '@models/post.model';
import { Comment } from '@models/comment.model';
import { AuthService } from '@services/auth.service';
import { LikeDislike } from '@models/likeDislike.model';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    currentUid: string | undefined;
    destroy$: Subject<boolean> = new Subject<boolean>();

    latestPosts: Observable<Post[]> | any;

    newCommentForm = new FormGroup({
        newComment: new FormControl('')
    });

    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;

    increment = firebase.firestore.FieldValue.increment(1);
    decrement = firebase.firestore.FieldValue.increment(-1);

    constructor(private dataService: DataService, private afs: AngularFirestore, private authService: AuthService,
                private afAuth: AngularFireAuth) {
        this.afAuth.authState.pipe(takeUntil(this.destroy$)).subscribe(user => {
            this.currentUid = user?.uid;
            this.dataService.getUserData(this.currentUid).ref.get().then(doc => {
                // console.log(doc.data());
                this.userFirstName = doc.data()?.firstName;
                this.userLastName = doc.data()?.lastName;
                this.userImageURL = doc.data()?.imageURL;
                console.log(this.userImageURL)
            });
        });
    }

    ngOnInit(): void {
        // this.loaded = true;
        // this.dataService.getPosts()
        //     .subscribe(data => {
        //     console.log(data);
        //     this.latestPosts = data;
        // });

        this.latestPosts = this.afs.collection<Post>('posts', posts => posts.orderBy('created', 'desc'))
            .snapshotChanges().pipe(map(actions => actions.map(a => {
                    const id = a.payload.doc.id;
                    const data = a.payload.doc.data() as Post;
                    // console.log(a.type);
                    return {id, ...data};
                    // this.latestPosts.push(a);
                    // }
                })
            ));
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    showHideComments(post: Post): void {
        if (!post.areCommentsVisible) {
            post.areCommentsVisible = true;
            this.dataService.getPostComments(post.id).subscribe(comments => {
                post.comments = comments;
            });
        } else {
            post.areCommentsVisible = false;
        }
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

    onReactionClick(postID: string, type: string): void {
        const reactionTypeCollection = this.afs.collection<Post>('posts').doc(postID).collection<LikeDislike>(type,
            likes => likes.where('uid', '==', this.currentUid));
        const reactionCounter = this.afs.collection<Post>('posts').doc(postID);

        reactionTypeCollection.get().toPromise().then(querySnapshot => {
            console.log(querySnapshot.docs);
            if (querySnapshot.docs.length > 0) {
                querySnapshot.forEach(doc => {
                    console.log(doc.ref.delete());
                    if (type === 'likes') {
                        reactionCounter.update({
                            numberOfLikes: this.decrement
                        });
                    } else if (type === 'dislikes') {
                        reactionCounter.update({
                            numberOfDislikes: this.decrement
                        });
                    }
                });
            } else {
                if (type === 'likes') {
                    reactionCounter.update({
                        numberOfLikes: this.increment
                    });
                } else if (type === 'dislikes') {
                    reactionCounter.update({
                        numberOfDislikes: this.increment
                    });
                }
                reactionTypeCollection.add({
                    uid: this.currentUid,
                    created: firebase.firestore.FieldValue.serverTimestamp(),
                    userFirstName: this.userFirstName,
                    userLastName: this.userLastName,
                    userImageURL: this.userImageURL,
                });
            }
        });
    }

}
