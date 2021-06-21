export interface Comment {
    content: string;
    uid: string | undefined;
    created: any;
    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;
    userIsTeacher: boolean | undefined;
    // numberOfLikes: number;
    // numberOfDislikes: number;
}
