import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { finalize, map, startWith, takeUntil } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';

import { DataService } from '@services/data.service';
import { AuthService } from '@services/auth.service';
import { University } from '@models/university.model';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    destroy$: Subject<boolean> = new Subject<boolean>();

    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;
    userEmail: string | undefined;
    userUniversity: string | undefined;
    userAccessCode: string | undefined;

    today: Date | undefined;
    filteredUniversities: Observable<University[]> | undefined;
    universities: University[] | undefined;
    isEditingMode = false;

    profileForm = new FormGroup({
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        email: new FormControl(''),
        university: new FormControl(''),
        accessCode: new FormControl(''),
    });

    basePath = '/profileImages';
    uploadedImageName: string | undefined;
    uploadedFile: any;

    constructor(private authService: AuthService, private dataService: DataService, private storage: AngularFireStorage, private afs: AngularFirestore) {
    }

    ngOnInit(): void {
        this.dataService.getUserData(this.authService.currentUid).ref.get().then(doc => {
            this.userFirstName = doc.data()?.firstName;
            this.userLastName = doc.data()?.lastName;
            this.userImageURL = doc.data()?.imageURL;
            this.userEmail = doc.data()?.email;
            this.userUniversity = doc.data()?.university;
            this.userAccessCode = doc.data()?.accessCode;
            this.populatePersonalDetails();
        });
        this.populateUniversityDropdown();
        this.today = new Date();
    }

    populatePersonalDetails(): void {
        this.profileForm.setValue({
            firstName: this.userFirstName,
            lastName: this.userLastName,
            email: this.userEmail,
            university: this.userUniversity,
            accessCode: this.userAccessCode
        });
    }

    toggleProfileEditing(): void {
        this.isEditingMode = !this.isEditingMode;
    }

    populateUniversityDropdown(): void {
        this.authService.getUniversities().pipe(takeUntil(this.destroy$)).subscribe(data => {
            this.universities = data;
            this.filteredUniversities = this.profileForm.get('university')?.valueChanges
                .pipe(
                    startWith(''),
                    map(value => this._filter(value))
                );
        });
    }

    private _filter(value: string): University[] {
        if (this.universities) {
            const filterValue = value?.toLowerCase();
            return this.universities.filter(option => option.name.toLowerCase().includes(filterValue));
        } else {
            return [];
        }
    }

    previewImage(event: any): void {
        this.uploadedImageName = event.target.files[0].name;
        this.uploadedFile = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            this.userImageURL = reader.result as string;
        };
        reader.readAsDataURL(this.uploadedFile);
    }

    uploadImage(): void {
        if (this.uploadedImageName !== undefined) {
            // const selectedFileForUpload = selectedFileName.substring(0, selectedFileName.lastIndexOf('.')) + Math.floor(Math.random() * 1000) + 1 + selectedFileName.substring(selectedFileName.lastIndexOf('.'));
            const filePath = `${this.basePath}/${this.uploadedImageName}`;
            const fileRef = this.storage.ref(filePath);
            const metadata = {
                cacheControl: 'public, max-age=4000'
            };
            const upload = this.storage.upload(filePath, this.uploadedFile, metadata);
            const postsBatch = this.afs.firestore.batch();
            const commentsBatch = this.afs.firestore.batch();

            console.log(this.uploadedFile);
            upload.snapshotChanges().pipe(finalize(() => {
                fileRef.getDownloadURL().pipe(takeUntil(this.destroy$)).subscribe(url => {
                    console.log(url);
                    this.userImageURL = url;
                    this.afs.collection('users').doc(this.authService.currentUid).set({
                        imageURL: url,
                    }, {merge: true});

                    this.afs.collection('posts', posts => posts.where('uid', '==', this.authService.currentUid))
                        .get().toPromise().then(response => {
                        response.docs.forEach(doc => {
                            postsBatch.update(doc.ref, {userImageURL: url});
                        });
                        postsBatch.commit();
                    });
                    this.afs.collectionGroup('comments', comments => comments.where('uid', '==', this.authService.currentUid))
                        .get().toPromise().then(response => {
                        response.docs.forEach(doc => {
                            commentsBatch.update(doc.ref, {userImageURL: url});
                            console.log(doc);
                        });
                        commentsBatch.commit();
                    });
                });
            })).pipe(takeUntil(this.destroy$)).subscribe();
        }
    }
}
