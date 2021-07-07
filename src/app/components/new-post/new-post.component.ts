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
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-new-post',
    templateUrl: './new-post.component.html',
    styleUrls: ['./new-post.component.scss']
})
export class NewPostComponent implements OnInit, OnDestroy {
    destroy$: Subject<boolean> = new Subject<boolean>();

    newPostForm = new FormGroup({
        newPostText: new FormControl(''),
        newPostImage: new FormControl(''),
        newPostFile: new FormControl('')
    });

    charactersLimit = 1000;
    charactersLeft = this.charactersLimit;
    currentUid: string | undefined;
    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;
    userUniversity: string | undefined;
    userIsTeacher: boolean | undefined;
    imagePath = '/postsImages';
    filePath = '/postsFiles';
    uploadedImageName: string | undefined;
    uploadedImage: any;
    uploadedFileName = '';
    uploadedFile: any;
    postImageURL: string | '' | undefined;
    postImageDlURL = '';
    postFileURL: string | undefined;
    postFileDlURL = '';

    snackbarText = '';
    oneCharacterRem = '';
    charactersRem = '';

    constructor(private afs: AngularFirestore, private afAuth: AngularFireAuth, private dataService: DataService,
                private storage: AngularFireStorage, private snackBar: MatSnackBar, private translate: TranslateService) {
        this.afAuth.authState.pipe(takeUntil(this.destroy$)).subscribe(user => {
            this.currentUid = user?.uid;
            this.dataService.getUserData(this.currentUid).ref.get().then(doc => {
                this.userFirstName = doc.data()?.firstName;
                this.userLastName = doc.data()?.lastName;
                this.userImageURL = doc.data()?.imageURL;
                this.userIsTeacher = doc.data()?.isTeacher;
                this.userUniversity = doc.data()?.university;
            });
        });
    }

    ngOnInit(): void {
        this.oneCharacterRem = this.translate.instant('oneCharacterRem');
        this.charactersRem = this.translate.instant('charactersRem');
        this.snackbarText = this.translate.instant('newPostSnackbar');
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
            userIsTeacher: this.userIsTeacher,
            fileName: this.uploadedFileName,
            fileURL: this.postFileDlURL,
            userUniversity: this.userUniversity
        });
        this.newPostForm.reset();
        this.uploadedImage = null;
        this.uploadedImageName = undefined;
        this.postImageURL = '';
        this.postImageDlURL = '';
        this.uploadedFile = null;
        this.uploadedFileName = '';
        this.postFileURL = '';
        this.charactersLeft = this.charactersLimit;

        const fileName = document.getElementById('file-upload');
        if (fileName) {
            fileName.style.display = 'none';
        }
    }

    isFormValid(): boolean {
        const postContent = this.newPostForm.get('newPostText')?.value;
        return !!(postContent && postContent.trim() || this.uploadedImage || this.uploadedFile);
    }

    previewImage(event: any): void {
        this.uploadedImageName = event.target.files[0].name;
        this.uploadedImage = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            this.postImageURL = reader.result as string;
        };
        reader.readAsDataURL(this.uploadedImage);
    }

    onNewPost(): void {
        if (this.uploadedImageName === undefined) {
            this.uploadedImageName = '';
        }
        if (this.isFormValid()) {
            if (this.uploadedImageName) {
                const selectedImageName = this.uploadedImageName;
                const selectedImageForUpload = selectedImageName.substring(0, selectedImageName.lastIndexOf('.'))
                    + new Date().getTime() + selectedImageName.substring(selectedImageName.lastIndexOf('.'));
                const imagePath = `${this.imagePath}/${selectedImageForUpload}`;
                const imageRef = this.storage.ref(imagePath);
                const metadata = {
                    cacheControl: 'public, max-age=3600'
                };
                const imageUpload = this.storage.upload(imagePath, this.uploadedImage, metadata);

                imageUpload.snapshotChanges().pipe(finalize(() => {
                    imageRef.getDownloadURL().pipe(takeUntil(this.destroy$)).subscribe(url => {
                        if (selectedImageName === '') {
                            url = '';
                        }
                        this.postImageDlURL = url;
                        this.saveNewPost();
                    });
                })).pipe(takeUntil(this.destroy$)).subscribe();
            } else if (this.uploadedFileName) {
                const selectedFileName = this.uploadedFileName;
                if (selectedFileName) {
                    const selectedFileForUpload = selectedFileName.substring(0, selectedFileName.lastIndexOf('.'))
                        + new Date().getTime() + selectedFileName.substring(selectedFileName.lastIndexOf('.'));
                    const filePath = `${this.filePath}/${selectedFileForUpload}`;
                    const fileRef = this.storage.ref(filePath);
                    const fileUpload = this.storage.upload(filePath, this.uploadedFile);

                    fileUpload.snapshotChanges().pipe(finalize(() => {
                        fileRef.getDownloadURL().pipe(takeUntil(this.destroy$)).subscribe(url => {
                            if (selectedFileName === '') {
                                url = '';
                            }
                            this.postFileDlURL = url;
                            this.saveNewPost();
                        });
                    })).pipe(takeUntil(this.destroy$)).subscribe();
                }
            } else {
                this.saveNewPost();
            }
            this.showSnackbar();
        }
    }


    onResetImgPreview(): void {
        this.uploadedImage = null;
        this.uploadedImageName = undefined;
        this.postImageURL = '';
    }

    onFileUpload(event: any): void {
        this.uploadedFileName = event.target.files[0]?.name;
        this.uploadedFile = event.target.files[0];
        console.log(event.target.files[0].name);
        const fileName = document.getElementById('file-upload');
        if (fileName) {
            fileName.style.display = 'inline';
        }
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
