import { map } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { MatDialog, MatDialogRef } from '@angular/material';
import { takeUntil } from 'rxjs/operators';
import { CreateUpdateRetroModalComponent } from '../create-update-retro-modal/create-update-retro-modal.component';
import { ExportService } from '../../services/export.service';
import { AuthService } from '../../services/auth.service';
import { RetroboardService } from '../../services/retroboard.service';
import { Retroboard, Bucket, Note, User } from '../../types';

@Component({
  selector: 'app-retroboard',
  templateUrl: './retroboard.component.html',
  styleUrls: ['./retroboard.component.scss'],
})
export class RetroBoardComponent implements OnInit, OnDestroy {
  retroboard: Retroboard;
  buckets: Bucket[];
  buckets$: Observable<Bucket[]>;
  notes$: Observable<Note[]>;
  activeBucket: Bucket;
  activeNote: Note;
  activeVote: boolean;
  jsonData: Object;
  dialogRef: MatDialogRef<any>;
  htmlExport: string;
  ngUnsubscribe: Subject<any> = new Subject();
  retroboardSubscription: Subscription;
  userDetails: firebase.User;
  appUser: User;
  isFavorite$: Observable<boolean>;

  constructor(
    private db: AngularFireDatabase,
    private route: ActivatedRoute,
    private authService: AuthService,
    private retroboardService: RetroboardService,
    private dialog: MatDialog,
    private router: Router,
    private exportService: ExportService
  ) {}

  private compareNotes(first: Note, second: Note) {
    if (first.voteCount < second.voteCount) {
      return 1;
    }
    if (first.voteCount > second.voteCount) {
      return -1;
    }
    return 0;
  }

  openModal(template: TemplateRef<any>, bucket: Bucket, note?: Note) {
    this.activeBucket = bucket;
    if (note) {
      this.activeNote = note;
    }
    this.dialogRef = this.dialog.open(template, {
      panelClass: 'custom-dialog-container',
    });
  }

  private getRetroboard(id: string) {
    this.retroboardSubscription = this.retroboardService.getRetroboard(id).subscribe(retroboard => {
      this.retroboard = retroboard;
      this.isFavorite$ = this.db
        .object<boolean>(`/users/${this.userDetails.uid}/favorites/${this.retroboard.key}`)
        .valueChanges();
    });
  }

  ngOnInit() {
    const retroboardId = this.route.snapshot.paramMap.get('id');
    this.userDetails = this.authService.getUserDetails();
    this.getRetroboard(retroboardId);

    this.buckets$ = this.db
      .list(`/buckets`, ref => ref.orderByChild('retroboardId').equalTo(retroboardId))
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => ({
            key: a.key,
            ...(a.payload.val() as any),
          }));
        }),
        map(buckets => {
          return buckets.map((bucket: Bucket) => {
            bucket.notes$ = this.db
              .list<Note>(`/notes`, ref => ref.orderByChild('bucketId').equalTo(bucket.key))
              .snapshotChanges()
              .pipe(
                map(actions =>
                  actions.map(a => ({
                    key: a.key,
                    ...(a.payload.val() as any),
                  }))
                ),
                map((notes: Note[]) => notes.sort(this.compareNotes))
              );
            return bucket;
          });
        })
      );

    this.jsonData = {};
    this.buckets$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(buckets => {
      this.buckets = buckets;
      buckets.forEach(bucket => {
        bucket.notes$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(notes => {
          notes.forEach(note => {
            if (!this.jsonData[bucket.key]) {
              this.jsonData[bucket.key] = {};
            }
            this.jsonData[bucket.key][note.key] = {
              bucketName: bucket.name,
              message: note.message,
              votes: note.voteCount || 0,
            };
          });
        });
      });
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.retroboardSubscription.unsubscribe();
  }

  async toggleFavorite() {
    const dataSnapshot = await this.db
      .object(`/users/${this.userDetails.uid}/favorites/${this.retroboard.key}`)
      .query.once('value');
    if (dataSnapshot.exists()) {
      await this.db.object(`/users/${this.userDetails.uid}/favorites/${this.retroboard.key}`).set(!dataSnapshot.val());
    } else {
      await this.db.object(`/users/${this.userDetails.uid}/favorites/${this.retroboard.key}`).set(true);
    }
  }

  async addNote(message: string) {
    this.appUser = await this.authService.getAppUser();
    await this.db.list(`/notes`).push({
      creator: this.appUser.displayName,
      creatorId: this.userDetails.uid,
      retroboardId: this.retroboard.key,
      bucketId: this.activeBucket.key,
      message: message,
      voteCount: 0,
      votes: {},
    });
    this.dialogRef.close();
  }

  async updateNote(message: string) {
    await this.db.object(`/notes/${this.activeNote.key}`).update({ message: message });
    this.dialogRef.close();
  }

  upvote(bucket: Bucket, note: Note) {
    if (bucket) {
      this.activeBucket = bucket;
    }
    if (note) {
      this.activeNote = note;
    }
    if (!this.activeNote.votes) {
      this.activeNote.votes = {};
    }

    if (this.activeNote.votes[this.userDetails.uid] !== true) {
      this.activeNote.votes[this.userDetails.uid] = true;
    } else {
      delete this.activeNote.votes[this.userDetails.uid];
    }

    this.activeNote.voteCount = Object.keys(this.activeNote.votes).reduce(
      (total, vote) => (this.activeNote.votes[vote] ? total + 1 : total - 1),
      0
    );

    this.db
      .object(`/notes/${this.activeNote.key}`)
      .update({
        votes: this.activeNote.votes,
        voteCount: this.activeNote.voteCount,
      })
      .then(() => (this.dialogRef ? this.dialogRef.close() : ''));
  }

  downvote(bucket: Bucket, note: Note) {
    if (bucket) {
      this.activeBucket = bucket;
    }
    if (note) {
      this.activeNote = note;
    }
    if (!this.activeNote.votes) {
      this.activeNote.votes = {};
    }

    if (this.activeNote.votes[this.userDetails.uid] !== false) {
      this.activeNote.votes[this.userDetails.uid] = false;
    } else {
      delete this.activeNote.votes[this.userDetails.uid];
    }

    this.activeNote.voteCount = Object.keys(this.activeNote.votes).reduce(
      (total, vote) => (this.activeNote.votes[vote] ? total + 1 : total - 1),
      0
    );

    this.db
      .object(`/notes/${this.activeNote.key}`)
      .update({
        votes: this.activeNote.votes,
        voteCount: this.activeNote.voteCount,
      })
      .then(() => (this.dialogRef ? this.dialogRef.close() : ''));
  }

  deleteNote() {
    delete this.jsonData[this.activeBucket.key][this.activeNote.key];
    this.db
      .object(`/notes/${this.activeNote.key}`)
      .remove()
      .then(() => this.dialogRef.close());
  }

  hasVoted(votes: { [userId: string]: boolean }, voted: boolean) {
    if (!votes) {
      return false;
    }
    if (voted) {
      return votes[this.userDetails.uid] === true;
    }
    return votes[this.userDetails.uid] === false;
  }

  deleteRetro(template: TemplateRef<any>) {
    const dialogRef = this.dialog.open(template);
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.retroboardService.deleteRetroboard(this.retroboard).then(() => this.router.navigate(['/home']));
      }
    });
  }

  openRetroboardDetailsModal() {
    this.dialogRef = this.dialog.open(CreateUpdateRetroModalComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        retroboard: this.retroboard,
        buckets: this.buckets,
      },
    });
  }

  openExportModal(template: TemplateRef<any>) {
    (<any>window).gtag('event', 'export', {
      event_category: 'retrospective',
      event_label: 'origin',
    });
    this.htmlExport = this.exportService.export(this.jsonData);
    this.dialogRef = this.dialog.open(template, {
      panelClass: 'custom-dialog-container',
    });
  }

  copyText() {
    let range;
    if ((document as any).selection) {
      range = (document.body as any).createTextRange();
      range.moveToElementText(document.getElementById('html-container'));
      range.select();
    } else if (window.getSelection) {
      range = document.createRange();
      range.selectNode(document.getElementById('html-container'));
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    }
    document.execCommand('copy');
  }

  trackByFn(index: number, item: Note) {
    return item.key;
  }
}
