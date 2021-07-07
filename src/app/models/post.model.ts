import firebase from 'firebase';
import FieldValue = firebase.firestore.FieldValue;

import { LikeDislike } from '@models/likeDislike.model';
import { Comment } from '@models/comment.model';

export interface Post {
    id?: string;
    content: string;
    created: any;
    imageURL?: string | undefined;
    fileName?: string | undefined;
    fileURL?: string | undefined;
    uid: string | undefined;
    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;
    userUniversity: string | undefined;
    userIsTeacher: boolean | undefined;
    areCommentsVisible?: boolean;
    comments?: Comment[];
    likes?: LikeDislike[];
    dislikes?: LikeDislike[];
    numberOfLikes?: FieldValue | number;
    numberOfDislikes?: FieldValue | number;
    numberOfComments?: FieldValue;
}
