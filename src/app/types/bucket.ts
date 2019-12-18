import { Observable } from 'rxjs';
import { Note } from '.';

export class Bucket {
  name: string;
  retroboardId: string;
  creator: string;
  creatorId: string;
  notes$?: Observable<Note[]>;
  key?: string;
}
