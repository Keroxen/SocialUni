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
        newPostText: new FormControl(null)
    });

    constructor(private afs: AngularFirestore) {
    }

    ngOnInit(): void {

    }

    onNewPost(): void {
        console.log(this.newPostForm.get('newPostText')?.value);
        const data = this.newPostForm.get('newPostText')?.value;
        if (data) {
            this.afs.collection('posts').add({
                content: data,
                created: firebase.firestore.FieldValue.serverTimestamp()
            });
            this.newPostForm.reset();
        } else {
            console.log('empty post');
        }
    }

}
