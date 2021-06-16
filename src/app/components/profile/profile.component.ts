import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { DataService } from '@services/data.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { University } from '@models/university.model';
import { finalize, map, startWith, takeUntil } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';

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
    userDob: string | number | Date | undefined;
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
        dob: new FormControl(''),
        email: new FormControl(''),
        university: new FormControl(''),
        accessCode: new FormControl(''),
    });


    constructor(private authService: AuthService, private dataService: DataService, private storage: AngularFireStorage) {
    }

    ngOnInit(): void {
        this.dataService.getUserData(this.authService.currentUid).ref.get().then(doc => {
            this.userFirstName = doc.data()?.firstName;
            this.userLastName = doc.data()?.lastName;
            this.userImageURL = doc.data()?.imageURL;
            this.userDob = doc.data()?.dob;
            // console.log(new Date(this.userDob).toLocaleDateString());
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
            dob: this.userDob,
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

}
