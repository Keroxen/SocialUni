import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase';

import { UserData } from '@models/userData.model';
import { Post } from '@models/post.model';
import { DataService } from '@services/data.service';

@Component({
    selector: 'app-new-post',
    templateUrl: './new-post.component.html',
    styleUrls: ['./new-post.component.scss']
})
export class NewPostComponent implements OnInit, OnDestroy {
    destroy$: Subject<boolean> = new Subject<boolean>();

    newPostForm = new FormGroup({
        newPostText: new FormControl('')
    });

    charactersLimit = 130;
    charactersLeft = this.charactersLimit;
    currentUid: string | undefined;
    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;

    constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth, private dataService: DataService) {
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

    }

    checkTextLength(): void {
        const currentLength = this.newPostForm.get('newPostText')?.value?.length;
        this.charactersLeft = this.charactersLimit - currentLength;
    }

    onNewPost(): void {
        console.log(this.newPostForm.get('newPostText')?.value);

        const postContent = this.newPostForm.get('newPostText')?.value;
        if (postContent && postContent.trim()) {
            this.afs.collection<Post>('posts').add({
                content: postContent,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                userFirstName: this.userFirstName,
                userLastName: this.userLastName,
                userImageURL: this.userImageURL,
            });
            this.newPostForm.reset();
            this.charactersLeft = this.charactersLimit;
        } else {
            console.log('empty post');
        }
    }


    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
