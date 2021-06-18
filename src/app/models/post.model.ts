import { LikeDislike } from '@models/likeDislike.model';
import firebase from 'firebase';
import FieldValue = firebase.firestore.FieldValue;

export interface Post {
    id?: string;
    content: string;
    created: any;
    imageURL?: string | undefined;
    uid: string | undefined;
    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;
    userIsTeacher: boolean | undefined;
    areCommentsVisible?: boolean;
    comments?: Comment[];
    likes?: LikeDislike[];
    dislikes?: LikeDislike[];
    numberOfLikes?: FieldValue;
    numberOfDislikes?: FieldValue;
    numberOfComments?: FieldValue;
}
