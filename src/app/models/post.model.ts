export interface Post {
    id?: string;
    content: string;
    created: any;
    userFirstName: string | undefined;
    userLastName: string | undefined;
    userImageURL: string | undefined;
    areCommentsVisible?: boolean;
    comments?: Comment[];
}
