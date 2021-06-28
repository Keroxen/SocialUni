import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DataSnapshot } from '@firebase/database-types';
import firebase from 'firebase';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();
// exports.postsChangeDetection = functions.firestore.document('/posts/{postId}/comments/{commentId}').onWrite((async (change, context) => {
//     const postId = context.params.postId;
//     const userId = context.params.userId;
//
//     if (!change.after.data()) {
//         return functions.logger.log(
//             'Post ', postId, 'deleted comment from user ', userId
//         );
//     }
//     functions.logger.log(
//         'User', userId, 'added a new comment to', postId
//     );
//
//     const getDeviceTokensPromise = admin.database().ref(`/users/${userId}/notificationTokens`).once('value');
//
//     const getCommentUserProfilePromise = admin.auth().getUser(userId);
//
//     let tokensSnapshot: DataSnapshot;
//
//     let tokens: string | any[];
//     const results = await Promise.all([getDeviceTokensPromise, getCommentUserProfilePromise]);
//     tokensSnapshot = results[0];
//     const user = results[1];
//
//     // Check if there are any device tokens.
//     if (!tokensSnapshot.hasChildren()) {
//         return functions.logger.log(
//             'There are no notification tokens to send to.'
//         );
//     }
//     functions.logger.log(
//         'There are',
//         tokensSnapshot.numChildren(),
//         'tokens to send notifications to.'
//     );
//     functions.logger.log('Fetched user profile', user);
//
//     // Notification details.
//     const payload = {
//         notification: {
//             title: 'You have a new comment!',
//             body: `${user.displayName} commented to your post.`,
//             icon: user.photoURL,
//         },
//     };
//
//     // Listing all tokens as an array.
//     tokens = Object.keys(tokensSnapshot.val());
//     // Send notifications to all tokens.
//     const response = await admin.messaging().sendToDevice(tokens, payload);
//     // For each message check if there was an error.
//     const tokensToRemove: any[] = [];
//     response.results.forEach((result, index) => {
//         const error = result.error;
//         if (error) {
//             functions.logger.error(
//                 'Failure sending notification to',
//                 tokens[index],
//                 error
//             );
//             // Cleanup the tokens who are not registered anymore.
//             if (error.code === 'messaging/invalid-registration-token' ||
//                 error.code === 'messaging/registration-token-not-registered') {
//                 tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
//             }
//         }
//     });
//     return Promise.all(tokensToRemove);
// }));


// export const writeCommentsTest = functions.firestore.document('posts/{postId}/comments/{commentId}').onWrite(((change, context) => {
//     functions.logger.log('cloud function is working');
//     const postId = context.params.postId;
//     const userId = context.params.userId;
//
//     if (!change.after.data()) {
//         return functions.logger.log(
//             'Post ', postId, 'deleted comment from user ', userId
//         );
//     }
//     functions.logger.log(
//         'User', userId, 'added a new comment to', postId
//     );
//
//     const getDeviceTokensPromise = admin.database(`/users/${userId}/notificationTokens`).once('value');
//
//
// }));


// exports.sendNewTripNotification = functions.database.ref('/{uid}/shared_trips/').onWrite(event => {
//     const uuid = event.params.uid;
//
//     console.log('User to send notification', uuid);
//
//     const ref = admin.database().ref(`Users/${uuid}/token`);
//     return ref.once('value', (snapshot) => {
//         const payload = {
//             notification: {
//                 title: 'You have been invited to a trip.',
//                 body: 'Tap here to check it out!'
//             }
//         };
//
//         admin.messaging().sendToDevice(snapshot.val(), payload);
//
//     }, (errorObject) => {
//         console.log('The read failed: ' + errorObject.code);
//     });
// });

exports.notifyUser = functions.firestore.document('posts/{postId}/comments/{commentId}').onCreate(event => {
    const commentData = event.data();
    const userId = commentData.uid;
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);


    // const postId = event.ref.parent.id;
    const parentPost = event.ref.parent.parent;

    parentPost?.get().then(post => {
        console.log('data in parent---', post.data());
        // .forEach(doc => {
        //     console.log('data in parent---', doc.data());
        // });
        // if (post.data()?.uid === userId) {
        const postUId = post.data()?.uid;
        console.log('IN IF DE LA POST UID === USERID');
        db.collection('users').doc(postUId).collection('notifications').add({
            userFirstName: commentData?.userFirstName,
            userLastName: commentData?.userLastName,
            userImageURL: commentData?.userImageURL,
            userIsTeacher: commentData?.userIsTeacher,
            uid: commentData?.uid,
            created: commentData?.created,
            postId: parentPost?.id,
        }).catch(err => console.log(err));

        //     .get().then(data => {
        //     console.log('------------------DATA-------------', data.data());
        //     const userData = data.data();
        //     if (userData) {
        //         userRef.collection('notifications').add({
        //             userFirstName: userData.userFirstName,
        //             userLastName: userData.userLastName,
        //             userImageURL: userData.userImageURL,
        //             userIsTeacher: userData.userIsTeacher,
        //             uid: userData.uid,
        //             created: userData.created,
        //             postId: parentPost?.id,
        //         }).catch(err => console.log(err));
        //     }
        // }).catch(err => console.log(err));
        // }
    }).catch(err => console.log(err));

    const payload = {
        notification: {
            title: 'New comment!',
            body: `${userId} posted a new comment to your post, --- ${commentData.userFirstName} --- name??`,
        },
    };

    return userRef.get().then(snapshot => snapshot.data())
        .then(user => {
            const tokens = user?.fcmTokens ? Object.keys(user.fcmTokens) : [];
            if (!tokens.length) {
                throw new Error('error!!!');
            }
            return admin.messaging().sendToDevice(tokens, payload);
        })
        .catch(err => console.log(err));
});
