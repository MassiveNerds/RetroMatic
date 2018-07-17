import { map } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { AngularFireAuth } from 'angularfire2/auth';
import { MatDialog } from '@angular/material';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-retro-board',
  templateUrl: './retro-board.component.html',
  styleUrls: ['./retro-board.component.scss'],
})
export class RetroBoardComponent implements OnInit, OnDestroy {
  uid: string;
  retroboard: any;
  buckets: Observable<any[]>;
  activeBucket: any;
  activeNote: any;
  activeVote: boolean;
  jsonData: Object;
  dialogRef;
  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    public afAuth: AngularFireAuth,
    public dialog: MatDialog,
  ) {}

  compareFn(a, b) {
    const aVotes = a.totalVotes || -1;
    const bVotes = b.totalVotes || -1;
    if (aVotes < bVotes) {
      return 1;
    }
    if (aVotes > bVotes) {
      return -1;
    }
    return 0;
  }

  openModal(template: TemplateRef<any>, bucket: any, note?: any) {
    this.activeBucket = bucket;
    if (note) {
      this.activeNote = note;
    }
    this.dialogRef = this.dialog.open(template, {
      panelClass: 'custom-dialog-container',
    });
  }

  ngOnInit() {
    this.afAuth.authState
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((result) => (this.uid = result.uid));
    const id = this.route.snapshot.paramMap.get('id');

    this.db
      .object(`/retroboards/${this.uid}/${id}`)
      .valueChanges()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((retroboard) => (this.retroboard = retroboard));

    this.buckets = this.db
      .list(`/buckets/${id}`)
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((a) => ({ key: a.key, ...a.payload.val() }));
        }),
        map((buckets) => {
          return buckets.map((bucket: any) => {
            bucket.notes = this.db
              .list(`/notes/${bucket.key}`)
              .snapshotChanges()
              .pipe(
                map((actions) => {
                  return actions.map((a) => ({
                    key: a.key,
                    ...a.payload.val(),
                  }));
                }),
                map((notes) => {
                  return notes.sort(this.compareFn);
                }),
              );
            return bucket;
          });
        }),
      );

    this.jsonData = {};
    this.buckets.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      data.map((bucket) => {
        this.db
          .list(`/notes/${bucket.key}`)
          .snapshotChanges()
          .pipe(
            map((actions) =>
              actions.map((a) => ({ key: a.key, ...a.payload.val() })),
            ),
          )
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((notes) => {
            notes.map((note: any) => {
              if (!this.jsonData[bucket.key]) {
                this.jsonData[bucket.key] = {};
              }
              this.jsonData[bucket.key][note.key] = {
                type: bucket.type,
                bucketName: bucket.name,
                message: note.message,
                votes: note.totalVotes || 0,
              };
            });
          });
      });
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  addNote(message: string) {
    this.db
      .list(`/notes/${this.activeBucket.key}`)
      .push({ message: message, votes: {} })
      .then(() => this.dialogRef.close());
  }

  updateNote(message: string) {
    this.db
      .object(`/notes/${this.activeBucket.key}/${this.activeNote.key}`)
      .update({ message: message })
      .then(() => this.dialogRef.close());
  }

  upVote(bucket?: any, note?: any) {
    if (bucket) {
      this.activeBucket = bucket;
    }
    if (note) {
      this.activeNote = note;
    }
    if (this.activeNote.votes) {
      this.activeNote.votes[this.uid] = true;
    } else {
      this.activeNote.votes = {};
      this.activeNote.votes[this.uid] = true;
    }
    this.activeNote.totalVotes = Object.keys(this.activeNote.votes).length;

    this.db
      .object(`/notes/${this.activeBucket.key}/${this.activeNote.key}`)
      .update({
        votes: this.activeNote.votes,
        totalVotes: this.activeNote.totalVotes,
      })
      .then(() => (this.dialogRef ? this.dialogRef.close() : ''));
  }

  downVote(bucket: any, note?: any) {
    if (bucket) {
      this.activeBucket = bucket;
    }
    if (note) {
      this.activeNote = note;
    }
    delete this.activeNote.votes[this.uid];
    this.activeNote.totalVotes = Object.keys(this.activeNote.votes).length;
    this.db
      .object(`/notes/${this.activeBucket.key}/${this.activeNote.key}`)
      .update({
        votes: this.activeNote.votes,
        totalVotes: this.activeNote.totalVotes,
      })
      .then(() => (this.dialogRef ? this.dialogRef.close() : ''));
  }

  deleteNote() {
    this.db
      .object(`/notes/${this.activeBucket.key}/${this.activeNote.key}`)
      .remove()
      .then(() => this.dialogRef.close());
  }
}
