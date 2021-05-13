import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';

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
        this.afs.collection('posts').doc().set({
            content: data,
        });
        this.newPostForm.reset();
    }

}
