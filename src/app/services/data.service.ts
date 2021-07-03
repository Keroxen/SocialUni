import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import DocumentData = firebase.firestore.DocumentData;

import { Post } from '@models/post.model';
import { UserData } from '@models/userData.model';
import { LikeDislike } from '@models/likeDislike.model';
import { AuthService } from '@services/auth.service';
import { Comment } from '@models/comment.model';
import { Notifications } from '@models/notifications.model';

@Injectable()
export class DataService {
    private postsCollection: AngularFirestoreCollection<Post> | undefined;
    private commentsCollection: AngularFirestoreCollection<Comment> | undefined;
    userData: UserData | undefined;

    increment = firebase.firestore.FieldValue.increment(1);
    decrement = firebase.firestore.FieldValue.increment(-1);
    postsCollectionRef = this.afs.collection<Post>('posts');
    usersCollectionRef = this.afs.collection<UserData>('users');

    constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth, private authService: AuthService) {
    }

    getPosts(): Observable<Post[]> {
        this.postsCollection = this.afs.collection<Post>('posts',
            posts => posts.orderBy('created', 'desc'));
        return this.postsCollection.valueChanges({idField: 'id'});
    }

    getUserData(currentUid: string | undefined): AngularFirestoreDocument<UserData> {
        return this.afs.collection<UserData>('users').doc(currentUid);
    }

    getPostComments(postID: string | undefined): Observable<Comment[]> {
        this.commentsCollection = this.afs.collection<Post>('posts').doc(postID).collection('comments', comments => comments.orderBy('created', 'desc'));
        return this.commentsCollection.valueChanges();
    }

    reactionClick(postID: string, reactionType: string, userFirstName: string | undefined, userLastName: string | undefined, userImageURL: string | undefined): void {
        const likesCollectionRef = this.postsCollectionRef.doc(postID).collection<LikeDislike>('likes',
            likes => likes.where('uid', '==', this.authService.currentUid));
        const dislikesCollectionRef = this.postsCollectionRef.doc(postID).collection<LikeDislike>('dislikes',
            dislikes => dislikes.where('uid', '==', this.authService.currentUid));
        const reactionsRef = this.postsCollectionRef.doc(postID);
        if (reactionType === 'like') {
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
                        uid: this.authService.currentUid,
                        created: firebase.firestore.FieldValue.serverTimestamp(),
                        userFirstName,
                        userLastName,
                        userImageURL,
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
        } else if (reactionType === 'dislike') {
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
                        uid: this.authService.currentUid,
                        created: firebase.firestore.FieldValue.serverTimestamp(),
                        userFirstName,
                        userLastName,
                        userImageURL,
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

    submitComment(comment: string, postID: string, userFirstName: string | undefined, userLastName: string | undefined, userImageURL: string | undefined, userIsTeacher: boolean | undefined): void {
        const postDoc = this.postsCollectionRef.doc(postID);
        if (comment && comment.trim()) {
            postDoc.collection<Comment>('comments').add({
                content: comment,
                uid: this.authService.currentUid,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                userFirstName,
                userLastName,
                userImageURL,
                userIsTeacher
            });
        }
    }

    async deletePost(postID: string): Promise<void> {
        await this.removeSavedPost(postID);
        return await this.postsCollectionRef.doc(postID).delete();
    }

    async removeSavedPost(postID: string): Promise<void> {
        return await this.usersCollectionRef.doc(this.authService.currentUid).update({
            savedPosts: firebase.firestore.FieldValue.arrayRemove(postID)
        });
    }

    savePost(postID: string): void {
        this.usersCollectionRef.doc(this.authService.currentUid).update({
            savedPosts: firebase.firestore.FieldValue.arrayUnion(postID)
        });
    }

    getSavedPosts(): AngularFirestoreDocument<UserData> {
        return this.usersCollectionRef.doc(this.authService.currentUid);
    }

    getReactionsList(postID: string | undefined, reactionType: string | undefined): Observable<DocumentData[]> {
        return this.postsCollectionRef.doc(postID).collection(reactionType as string, (reaction: any) => reaction.orderBy('created', 'desc')).valueChanges({idField: 'id'});
    }

    getUsers(start: any, end: any): Observable<UserData[]> {
        return this.afs.collection<UserData>('users', users => users.limit(2)
            .orderBy('firstName').orderBy('lastName').startAt(start).endAt(end)).valueChanges({idField: 'id'});
    }

    getUserNotifications(): Observable<Notifications[]> {
        return this.usersCollectionRef.doc(this.authService.currentUid).collection<Notifications>('notifications', notifications => notifications.orderBy('created', 'desc')).valueChanges();
    }

}
