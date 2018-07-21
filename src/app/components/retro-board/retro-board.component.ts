import { map } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { ActivatedRoute, Router } from '@angular/router';
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
  user: any;
  retroboard: any;
  buckets: any;
  buckets$: Observable<any[]>;
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
    private router: Router,
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
    const id = this.route.snapshot.paramMap.get('id');

    this.afAuth.authState
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((user) => {
        this.user = user;
        this.db
          .object(`/retroboards/${user.uid}/${id}`)
          .snapshotChanges()
          .pipe(
            map((snapshot) => {
              return { key: snapshot.key, ...snapshot.payload.val() };
            }),
          )
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((retroboard) => (this.retroboard = retroboard));
      });

    this.buckets$ = this.db
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
    this.buckets$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((buckets) => {
      this.buckets = buckets;
      buckets.map((bucket) => {
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
    if (!this.activeNote.votes) {
      this.activeNote.votes = {};
    }

    if (this.activeNote.votes[this.user.uid] !== true) {
      this.activeNote.votes[this.user.uid] = true;
    } else {
      delete this.activeNote.votes[this.user.uid];
    }

    this.activeNote.totalVotes = Object.keys(this.activeNote.votes).reduce(
      (total, vote) => (this.activeNote.votes[vote] ? total + 1 : total - 1),
      0,
    );

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
    if (!this.activeNote.votes) {
      this.activeNote.votes = {};
    }

    if (this.activeNote.votes[this.user.uid] !== false) {
      this.activeNote.votes[this.user.uid] = false;
    } else {
      delete this.activeNote.votes[this.user.uid];
    }

    this.activeNote.totalVotes = Object.keys(this.activeNote.votes).reduce(
      (total, vote) => (this.activeNote.votes[vote] ? total + 1 : total - 1),
      0,
    );

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

  hasVoted(votes, voted) {
    if (!votes) {
      return false;
    }
    if (voted) {
      return votes[this.user.uid] === true;
    }
    return votes[this.user.uid] === false;
  }

  deleteRetro(template: TemplateRef<any>) {
    const dialogRef = this.dialog.open(template);

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        Promise.all(
          this.buckets.map((bucket) =>
            this.db.object(`/notes/${bucket.key}`).remove(),
          ),
        )
          .then(() =>
            this.db.object(`/buckets/${this.retroboard.key}`).remove(),
          )
          .then(() =>
            this.db
              .object(`/retroboards/${this.user.uid}/${this.retroboard.key}`)
              .remove(),
          )
          .then(() => this.router.navigate(['/home']));
      }
    });
  }
}
