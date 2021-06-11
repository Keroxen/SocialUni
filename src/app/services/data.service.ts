import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { Post } from '@models/post.model';
import { UserData } from '@models/userData.model';

@Injectable()
export class DataService {
    private postsCollection: AngularFirestoreCollection<Post> | undefined;
    private commentsCollection: AngularFirestoreCollection<Comment> | undefined;
    userData: UserData | undefined;

    constructor(private afs: AngularFirestore) {
    }

    getPosts(): Observable<Post[]> {
        this.postsCollection = this.afs.collection<Post>('posts', posts => posts.orderBy('created', 'desc'));
        return this.postsCollection.valueChanges({idField: 'id'});
    }

    getUserData(currentUid: string | undefined): AngularFirestoreDocument<UserData> {
        return this.afs.collection<UserData>('users').doc(currentUid);
    }

    getPostComments(postID: string | undefined): Observable<Comment[]> {
        this.commentsCollection = this.afs.collection<Post>('posts').doc(postID).collection('comments');
        return this.commentsCollection.valueChanges();
    }

}
