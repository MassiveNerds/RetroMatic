import { map } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Database, ref, list, object, objectVal, query, orderByChild, equalTo, push, set, update, remove, get } from '@angular/fire/database';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { CreateUpdateRetroModalComponent } from '../create-update-retro-modal/create-update-retro-modal.component';
import { ExportDialogComponent } from '../export-dialog/export-dialog.component';
import { ExportService } from '../../services/export.service';
import { AuthService } from '../../services/auth.service';
import { RetroboardService } from '../../services/retroboard.service';
import { RetroStateService } from '../../services/retro-state.service';
import { Retroboard, Bucket, Note, User } from '../../types';

@Component({
  standalone: false,
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
  routeChange$: Subject<void> = new Subject();
  retroboardSubscription: Subscription;
  userDetails: any;
  appUser: User;
  isFavorite$: Observable<boolean>;

  constructor(
    private db: Database,
    private route: ActivatedRoute,
    private authService: AuthService,
    private retroboardService: RetroboardService,
    private retroStateService: RetroStateService,
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
      this.retroStateService.setRetroboard(retroboard);
      this.isFavorite$ = objectVal<boolean>(
        ref(this.db, `/users/${this.userDetails.uid}/favorites/${this.retroboard.key}`)
      );
    });
  }

  ngOnInit() {
    this.userDetails = this.authService.getUserDetails();

    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      this.routeChange$.next();
      if (this.retroboardSubscription) {
        this.retroboardSubscription.unsubscribe();
      }

      const retroboardId = params.get('id');
      this.getRetroboard(retroboardId);

      this.buckets$ = list(
        query(ref(this.db, '/buckets'), orderByChild('retroboardId'), equalTo(retroboardId))
      ).pipe(
        map(changes => changes.map(c => ({ key: c.snapshot.key, ...(c.snapshot.val() as any) }))),
        map(buckets => {
          return buckets.map((bucket: Bucket) => {
            bucket.notes$ = list(
              query(ref(this.db, '/notes'), orderByChild('bucketId'), equalTo(bucket.key))
            ).pipe(
              map(changes => changes.map(c => ({ key: c.snapshot.key, ...(c.snapshot.val() as any) }))),
              map((notes: Note[]) => notes.sort(this.compareNotes))
            );
            return bucket;
          });
        })
      );

      this.jsonData = {};
      this.buckets$.pipe(
        takeUntil(this.ngUnsubscribe),
        takeUntil(this.routeChange$)
      ).subscribe(buckets => {
        this.buckets = buckets;
        buckets.forEach(bucket => {
          bucket.notes$.pipe(
            takeUntil(this.ngUnsubscribe),
            takeUntil(this.routeChange$)
          ).subscribe(notes => {
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
            this.retroStateService.setExportData(this.jsonData);
          });
        });
      });
    });
  }

  ngOnDestroy() {
    this.routeChange$.next();
    this.routeChange$.complete();
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
    if (this.retroboardSubscription) {
      this.retroboardSubscription.unsubscribe();
    }
    this.retroStateService.setRetroboard(null);
    this.retroStateService.setExportData(null);
  }

  async toggleFavorite() {
    const favRef = ref(this.db, `/users/${this.userDetails.uid}/favorites/${this.retroboard.key}`);
    const dataSnapshot = await get(favRef);
    if (dataSnapshot.exists()) {
      await set(favRef, !dataSnapshot.val());
    } else {
      await set(favRef, true);
    }
  }

  async addNote(message: string) {
    this.appUser = await this.authService.getAppUser();
    await push(ref(this.db, '/notes'), {
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
    await update(ref(this.db, `/notes/${this.activeNote.key}`), { message: message });
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

    update(ref(this.db, `/notes/${this.activeNote.key}`), {
      votes: this.activeNote.votes,
      voteCount: this.activeNote.voteCount,
    });
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

    update(ref(this.db, `/notes/${this.activeNote.key}`), {
      votes: this.activeNote.votes,
      voteCount: this.activeNote.voteCount,
    });
  }

  deleteNote() {
    delete this.jsonData[this.activeBucket.key][this.activeNote.key];
    remove(ref(this.db, `/notes/${this.activeNote.key}`)).then(() => this.dialogRef.close());
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
        this.retroboardService.deleteRetroboard(this.retroboard).then(() => this.router.navigate(['/app']));
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

  openExportModal() {
    const html = this.exportService.export(this.jsonData);
    this.dialog.open(ExportDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: { html },
    });
  }

  getUpvotes(votes: { [uid: string]: boolean }): number {
    if (!votes) return 0;
    return Object.values(votes).filter(v => v === true).length;
  }

  getDownvotes(votes: { [uid: string]: boolean }): number {
    if (!votes) return 0;
    return Object.values(votes).filter(v => v === false).length;
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
