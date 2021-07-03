import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class MessagingService {
    private messaging = firebase.messaging();

    private messageSource = new Subject<any>();
    currentMessage = this.messageSource.asObservable();

    constructor(private afs: AngularFirestore) {
    }

    getPermission(user: any): void {
        this.messaging.getToken().then(token => {
            this.saveToken(user, token);
        });
    }

    receiveMessage(): void {
        this.messaging.onMessage(payload => {
            console.log('message received', payload);
            this.messageSource.next(payload);
        });
    }

    private saveToken(user: any, token: any): void {
        const currentTokens = user.fcmTokens || {};
        console.log(currentTokens, token);

        if (!currentTokens[token]) {
            const userRef = this.afs.collection('users').doc(user.uid);
            const tokens = {...currentTokens, [token]: true};
            userRef.update({fcmTokens: tokens});
        }
    }

}
