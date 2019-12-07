export class Note {
    creator: string;
    creatorId: string;
    retroboardId: string;
    bucketId: string;
    message: string;
    voteCount: number;
    votes: { [userId: string]: boolean };
    key?: string;
}