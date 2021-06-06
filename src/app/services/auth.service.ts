import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { User } from '@models/user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthResponseData } from '@models/auth.model';
import { University } from '@models/university.model';
import { catchError, map, tap } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { UserData } from '@models/userData.model';

@Injectable()
export class AuthService {
    user = new BehaviorSubject<User | null>(null);
    private tokenExpirationTimer: any;
    currentUid: string | undefined;
    private authMode: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    public authMode$: Observable<string | null> = this.authMode.asObservable();

    private universitiesCollection: AngularFirestoreCollection<University> | undefined;

    constructor(private http: HttpClient, private router: Router, private afs: AngularFirestore, private afAuth: AngularFireAuth) {
        this.afAuth.authState.subscribe(user => {
            if (user) {
                console.log(user);
                this.currentUid = user.uid;
                console.log('this.currentUid ', this.currentUid);
                localStorage.setItem('user', JSON.stringify(user));
                JSON.parse(localStorage.getItem('user') as string);
            }
        });
    }

    signUp2(email: string, password: string, firstName: string, lastName: string, dob: string, university: string, accessCode: string) {
        this.afAuth.createUserWithEmailAndPassword(email, password).then(newUser => {
            console.log('success', newUser);
            const newUserRef: AngularFirestoreDocument<UserData> = this.afs.doc(`users/${newUser.user?.uid}`);
            // this.afs.collection<UserData>('users').doc().set({
            newUserRef.set({
                firstName,
                lastName,
                dob,
                email,
                university,
                accessCode,
                imageURL: ''
            });
            this.router.navigateByUrl('/home');
        }).catch(error => {
            console.log('error', error);
        });
    }

    logIn2(email: string, password: string) {
        this.afAuth.signInWithEmailAndPassword(email, password)
            .then(status => {
                console.log('logged in', status);
                this.router.navigateByUrl('/home');
            }).catch(error => {
            console.log('failed to log in', error);
        });
    }

    logOut2() {
        this.afAuth.signOut().then(() => {
            localStorage.removeItem('user');
            this.router.navigate(['/']);
        });
    }

    get isLoggedIn(): boolean {
        const user = JSON.parse(localStorage.getItem('user') as string);
        return user !== null;
    }

    // signup(email: string, password: string): Observable<AuthResponseData> {
    //     return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDXN5g_Z4BAczJ9Jb-pZ8b4mRdfYB0AU_0',
    //         {
    //             email,
    //             password,
    //             returnSecureToken: true
    //         }
    //     ).pipe(catchError(this.handleError), tap(resData => {
    //         this.handleAuth(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
    //     }));
    // }
    //
    // login(email: string, password: string): Observable<AuthResponseData> {
    //     return this.http.post<AuthResponseData>(
    //         'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDXN5g_Z4BAczJ9Jb-pZ8b4mRdfYB0AU_0',
    //         {
    //             email,
    //             password,
    //             returnSecureToken: true,
    //         }
    //     ).pipe(catchError(this.handleError), tap(resData => {
    //         this.handleAuth(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
    //     }));
    // }

    // private handleAuth(email: string, userId: string, token: string, expiresIn: number): void {
    //     const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    //     const user = new User(email, userId, token, expirationDate);
    //     this.user.next(user);
    //     this.autoLogout(expiresIn * 1000);
    //     localStorage.setItem('userData', JSON.stringify(user));
    // }
    //
    // autoLogin(): void {
    //     const userData: {
    //         email: string,
    //         id: string,
    //         _token: string,
    //         _tokenExpirationDate: string
    //     } = JSON.parse(localStorage.getItem('userData') as string);
    //     if (!userData) {
    //         return;
    //     }
    //     const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));
    //
    //     if (loadedUser.token) {
    //         this.user.next(loadedUser);
    //         const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
    //         this.autoLogout(expirationDuration);
    //     }
    // }

    updateAuthMode(authMode: string | null): void {
        this.authMode.next(authMode);
    }

    // private handleError(errorRes: HttpErrorResponse) {
    //     let errorMessage = 'An unknown error occurred!';
    //     if (!errorRes.error || !errorRes.error.error) {
    //         return throwError(errorMessage);
    //     }
    //     switch (errorRes.error.error.message) {
    //         case 'EMAIL_EXISTS':
    //             errorMessage = 'This email already exists!';
    //             break;
    //         case 'EMAIL_NOT_FOUND':
    //             errorMessage = 'This email does not exist!';
    //             break;
    //         case 'INVALID_PASSWORD':
    //             errorMessage = 'Wrong password!';
    //             break;
    //         case 'INVALID_EMAIL':
    //             errorMessage = 'Wrong email!';
    //             break;
    //     }
    //     return throwError(errorMessage);
    // }
    //
    // logout(): void {
    //     this.user.next(null);
    //     this.router.navigate(['/landing-page']);
    //     localStorage.removeItem('userData');
    //     if (this.tokenExpirationTimer) {
    //         clearTimeout(this.tokenExpirationTimer);
    //     }
    //     this.tokenExpirationTimer = null;
    // }
    //
    // autoLogout(expirationDuration: number): void {
    //     console.log(expirationDuration);
    //     this.tokenExpirationTimer = setTimeout(() => {
    //         this.logout();
    //     }, expirationDuration);
    // }

    getUniversities(): Observable<University[]> {
        this.universitiesCollection = this.afs.collection<University>('universities');
        return this.universitiesCollection.valueChanges();
    }

    // get currentUid() {
    //     return this.afAuth.authState.
    // }

    // saveUser(firstName: string, lastName: string, dob: string, email: string, university: string, accessCode: string): void {
    //     this.afs.collection('users').doc().set({
    //         uid:
    //         firstName,
    //         lastName,
    //         dob,
    //         email,
    //         university,
    //         accessCode
    //     });
    // }

    // getUserData() {
    //     // this.afs.collection<UserData>('users').doc(this.currentUid).ref.get().then(doc => {
    //     //     console.log(doc.data());
    //     //     console.log(doc);
    //     // });
    //
    //     // return this.afs.collection<UserData>('users').doc(this.currentUid).snapshotChanges().pipe(
    //     //     map(actions => {
    //     //         console.log("here",actions.payload.data);
    //     //     })
    //     // );
    //     console.log('here');
    //     console.log('here id',this.currentUid);
    //
    //     this.afs.collection('users').doc(this.currentUid).snapshotChanges().pipe(map(changes => {
    //         const data = changes.payload.data;
    //         const id = changes.payload.id;
    //         // return { id, ...data };
    //         console.log('here3');
    //
    //         console.log(data);
    //         console.log(changes);
    //     }));
    //
    //     // let document = this.afs.doc(this.currentUid).get().toPromise()
    //     // return document.data
    // }
}
