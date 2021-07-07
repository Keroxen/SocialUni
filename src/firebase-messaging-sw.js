importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.8/firebase-messaging.js');

firebase.initializeApp({
    apiKey: 'AIzaSyCYDuT9LeeGPQQ-gy9Dv1msCs4z220vemM',
    projectId: 'alin-licenta-c406d',
    appId: "1:38878269773:web:13b42f2fa3def002222704",
    messagingSenderId: '38878269773'
});

const messaging = firebase.messaging();

