import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { MatSnackBar } from '@angular/material/snack-bar';
import firebase from 'firebase';

import { DataService } from '@services/data.service';
import { Post } from '@models/post.model';
import { SnackbarComponent } from '@shared/components/snackbar/snackbar.component';

@Component({
    selector: 'app-new-post',
    templateUrl: './new-post.component.html',
    styleUrls: ['./new-post.component.scss']
})
export class NewPostComponent implements OnInit, OnDestroy {
    destroy$: Subject<boolean> = new Subject<boolean>();

    newPostForm = new FormGroup({
        newPostText: new FormControl(''),
        newPostImage: new FormControl('')
    });

    charactersLimit = 1380;
    charactersLeft = this.charactersLimit;
    currentUid: string | undefined;
    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;
    userIsTeacher: boolean | undefined;

    basePath = '/postsImages';
    uploadedImageName: string | undefined;
    uploadedFile: any;
    postImageURL: string | undefined;
    postImageDlURL: string | undefined;

    snackbarText = 'New post added!';

    constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth, private dataService: DataService,
                private storage: AngularFireStorage, private snackBar: MatSnackBar) {
        this.afAuth.authState.pipe(takeUntil(this.destroy$)).subscribe(user => {
            this.currentUid = user?.uid;
            this.dataService.getUserData(this.currentUid).ref.get().then(doc => {
                this.userFirstName = doc.data()?.firstName;
                this.userLastName = doc.data()?.lastName;
                this.userImageURL = doc.data()?.imageURL;
                this.userIsTeacher = doc.data()?.isTeacher;
            });
        });
    }

    ngOnInit(): void {

    }

    checkTextLength(): void {
        const currentLength = this.newPostForm.get('newPostText')?.value?.length;
        this.charactersLeft = this.charactersLimit - currentLength;
    }

    saveNewPost(): void {
        const postContent = this.newPostForm.get('newPostText')?.value;
        this.afs.collection<Post>('posts').add({
            content: postContent,
            created: firebase.firestore.FieldValue.serverTimestamp(),
            imageURL: this.postImageDlURL,
            uid: this.currentUid,
            userFirstName: this.userFirstName,
            userLastName: this.userLastName,
            userImageURL: this.userImageURL ?? '',
            userIsTeacher: this.userIsTeacher
        });
        this.newPostForm.reset();
        this.uploadedFile = null;
        this.uploadedImageName = undefined;
        this.postImageURL = '';
        this.charactersLeft = this.charactersLimit;
    }

    isFormValid(): boolean {
        const postContent = this.newPostForm.get('newPostText')?.value;
        return !!(postContent && postContent.trim() || this.uploadedFile);
    }

    previewImage(event: any): void {
        this.uploadedImageName = event.target.files[0].name;
        this.uploadedFile = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            this.postImageURL = reader.result as string;
        };
        reader.readAsDataURL(this.uploadedFile);
    }

    onNewPost(): void {
        if (this.uploadedImageName === undefined) {
            this.uploadedImageName = '';
        }
        if (this.isFormValid()) {
            const selectedFileName = this.uploadedImageName;
            const selectedFileForUpload = selectedFileName.substring(0, selectedFileName.lastIndexOf('.'))
                + Math.floor(Math.random() * 10000) + 1 + selectedFileName.substring(selectedFileName.lastIndexOf('.'));
            const filePath = `${this.basePath}/${selectedFileForUpload}`;
            const fileRef = this.storage.ref(filePath);
            const metadata = {
                cacheControl: 'public, max-age=4000'
            };
            const upload = this.storage.upload(filePath, this.uploadedFile, metadata);

            upload.snapshotChanges().pipe(finalize(() => {
                fileRef.getDownloadURL().pipe(takeUntil(this.destroy$)).subscribe(url => {
                    if (selectedFileName === '') {
                        url = '';
                    }
                    console.log(url);
                    this.postImageDlURL = url;
                    this.saveNewPost();
                });
            })).pipe(takeUntil(this.destroy$)).subscribe();
            this.showSnackbar();
        }
    }

    onResetImgPreview(): void {
        this.uploadedFile = null;
        this.uploadedImageName = undefined;
        this.postImageURL = '';
    }

    showSnackbar(): void {
        this.snackBar.openFromComponent(SnackbarComponent, {
            data: this.snackbarText,
            duration: 1500
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }
}
