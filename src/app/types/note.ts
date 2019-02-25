export class Note {
    message: string;
    totalVotes?: number;
    votes?: { [id: string]: boolean };
    key?: string;
}