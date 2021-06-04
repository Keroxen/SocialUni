import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase';

@Component({
    selector: 'app-new-post',
    templateUrl: './new-post.component.html',
    styleUrls: ['./new-post.component.scss']
})
export class NewPostComponent implements OnInit {

    newPostForm = new FormGroup({
        newPostText: new FormControl('')
    });

    charactersLimit = 130;
    charactersLeft = this.charactersLimit;

    constructor(private afs: AngularFirestore) {
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
                created: firebase.firestore.FieldValue.serverTimestamp()
            });
            this.newPostForm.reset();
            this.charactersLeft = this.charactersLimit;
        } else {
            console.log('empty post');
        }
    }

}
