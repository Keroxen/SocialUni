// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
// import firebase from "firebase";

importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.

firebase.initializeApp({
    apiKey: 'AIzaSyCYDuT9LeeGPQQ-gy9Dv1msCs4z220vemM',
    // authDomain: 'alin-licenta-c406d.firebaseapp.com',
    // // databaseURL: 'alin-licenta-c406d',
    projectId: 'alin-licenta-c406d',
    // storageBucket: 'alin-licenta-c406d.appspot.com',
    // messagingSenderId: '38878269773',
    appId: "1:38878269773:web:13b42f2fa3def002222704",
    messagingSenderId: '38878269773'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// messaging.getToken({vapidKey: 'BKDV3TZ-MPanJE-cU5x1eqR62fKfBjxfyiib67QKKAcakH9AFkO8AkcINs_ZS0ADYC-IRQjouTOFbR7XnSs0h8I'}).then((currentToken) => {
//     if (currentToken) {
//         // Send the token to your server and update the UI if necessary
//         // ...
//     } else {
//         // Show permission request UI
//         console.log('No registration token available. Request permission to generate one.');
//         // ...
//     }
// }).catch((err) => {
//     console.log('An error occurred while retrieving token. ', err);
//     // ...
// });
