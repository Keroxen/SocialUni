import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase';

import { AuthService } from '@services/auth.service';
import { UserData } from '@models/userData.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-new-post',
    templateUrl: './new-post.component.html',
    styleUrls: ['./new-post.component.scss']
})
export class NewPostComponent implements OnInit {
    destroy$: Subject<boolean> = new Subject<boolean>();

    newPostForm = new FormGroup({
        newPostText: new FormControl('')
    });

    charactersLimit = 130;
    charactersLeft = this.charactersLimit;
    currentUid: string | undefined;
    userDetails: unknown;
    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;

    constructor(private afs: AngularFirestore, private authService: AuthService, private afAuth: AngularFireAuth) {
        this.afAuth.authState.pipe(takeUntil(this.destroy$)).subscribe(user => {
            this.currentUid = user?.uid;
            this.getUserData();
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
            this.afs.collection('posts').add({
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

    getUserData() {
        this.afs.collection<UserData>('users').doc(this.currentUid).ref.get().then(doc => {
            // this.userDetails = doc.data();
            this.userFirstName = doc.data()?.firstName;
            this.userLastName = doc.data()?.lastName;
            this.userImageURL = doc.data()?.imageURL;
            // console.log(doc.data());
            console.log(this.userDetails);
        });
    }
}
