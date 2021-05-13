import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Post } from '@models/post.model';
import { Observable } from 'rxjs';

@Injectable()
export class DataService {
    private postsCollection: AngularFirestoreCollection<Post> | undefined;

    constructor(private afs: AngularFirestore) {
    }

    getPosts(): Observable<Post[]> {
        this.postsCollection = this.afs.collection<Post>('posts');
        return this.postsCollection.valueChanges();
    }
}
