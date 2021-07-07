import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

exports.commentNotification = functions.firestore.document('posts/{postId}/comments/{commentId}').onCreate(event => {
    const commentData = event.data();
    const userId = commentData.uid;
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const parentPost = event.ref.parent.parent;
    parentPost?.get().then(post => {
        const postUId = post.data()?.uid;
        db.collection('users').doc(postUId).collection('notifications').add({
            userFirstName: commentData?.userFirstName,
            userLastName: commentData?.userLastName,
            userImageURL: commentData?.userImageURL,
            userIsTeacher: commentData?.userIsTeacher,
            uid: commentData?.uid,
            created: commentData?.created,
            postId: parentPost?.id,
        }).then(() => {
            const payload = {
                notification: {
                    title: 'New comment',
                    body: `${commentData?.userFirstName} ${commentData?.userLastName}` + ' added a new comment to your post',
                },
                data: {
                    userImg: `${commentData?.userImageURL}`,
                    userFirstName: `${commentData?.userFirstName}`,
                    userLastName: `${commentData?.userLastName}`,
                    userIsTeacher: `${commentData?.userIsTeacher}`,
                    postId: `${parentPost?.id}`,
                    uid: postUId,
                },
            };
            return userRef.get().then(snapshot => snapshot.data())
                .then(user => {
                    const tokens = user?.fcmTokens ? Object.keys(user.fcmTokens) : [];
                    if (!tokens.length) {
                        throw new Error('There was an error retrieving the token');
                    }
                    return admin.messaging().sendToDevice(tokens, payload);
                })
                .catch(err => console.log(err));
        }).catch(err => console.log(err));
    }).catch(err => console.log(err));
    return 0;
});
