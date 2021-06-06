import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import { University } from '@models/university.model';
import { UserData } from '@models/userData.model';
import { NavigationPaths } from '@models/nav-enum.model';

@Injectable()
export class AuthService {
    currentUid: string | undefined;
    private authMode: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    public authMode$: Observable<string | null> = this.authMode.asObservable();

    private universitiesCollection: AngularFirestoreCollection<University> | undefined;
    public navigationPathEnum = NavigationPaths;

    constructor(private router: Router, private afs: AngularFirestore, private afAuth: AngularFireAuth) {
        this.afAuth.authState.subscribe(user => {
            if (user) {
                this.currentUid = user.uid;
                console.log('this.currentUid ', this.currentUid);
                localStorage.setItem('user', JSON.stringify(user));
                JSON.parse(localStorage.getItem('user') as string);
            }
        });
    }

    signUp(email: string, password: string, firstName: string, lastName: string, dob: string, university: string, accessCode: string): void {
        this.afAuth.createUserWithEmailAndPassword(email, password).then(newUser => {
            console.log('success', newUser);
            const newUserRef: AngularFirestoreDocument<UserData> = this.afs.doc(`users/${newUser.user?.uid}`);
            newUserRef.set({
                firstName,
                lastName,
                dob,
                email,
                university,
                accessCode,
                imageURL: ''
            });
            this.router.navigateByUrl(this.navigationPathEnum.Home);
        }).catch(error => {
            console.log('error', error);
        });
    }

    logIn(email: string, password: string): void {
        this.afAuth.signInWithEmailAndPassword(email, password)
            .then(status => {
                console.log('logged in', status);
                this.router.navigateByUrl(this.navigationPathEnum.Home);
            }).catch(error => {
            console.log('failed to log in', error);
        });
    }

    logOut(): void {
        this.afAuth.signOut().then(() => {
            localStorage.removeItem('user');
            this.router.navigateByUrl(this.navigationPathEnum.LandingPage);
        });
    }

    get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user') as string);
        return user !== null;
    }

    updateAuthMode(authMode: string | null): void {
        this.authMode.next(authMode);
    }

    getUniversities(): Observable<University[]> {
        this.universitiesCollection = this.afs.collection<University>('universities');
        return this.universitiesCollection.valueChanges();
    }

}
