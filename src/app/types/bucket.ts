import { Observable } from "rxjs";
import { Note } from ".";

export class Bucket {
    name: string;
    retroboardId: string;
    notes$?: Observable<Note[]>
    key?: string;
}
