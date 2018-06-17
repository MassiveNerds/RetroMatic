import { map, switchMap } from 'rxjs/operators';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-retro-board',
  templateUrl: './retro-board.component.html',
  styleUrls: ['./retro-board.component.less'],
})
export class RetroBoardComponent implements OnInit {
  user: Observable<firebase.User>;
  uid: string;
  retroboard: any;
  buckets: Observable<any[]>;
  modalRef: BsModalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: false,
  };
  activeBucket: any;
  activeNote: any;
  activeVote: boolean;
  jsonData: Object;

  constructor(
    private db: AngularFireDatabase,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
    public afAuth: AngularFireAuth,
  ) {
    this.user = afAuth.authState;
    this.user.subscribe((result) => (this.uid = result.uid));
  }

  compareFn = (a, b) => {
    const aVotes = a.totalVotes || -1;
    const bVotes = b.totalVotes || -1;
    if (aVotes < bVotes) {
      return 1;
    }
    if (aVotes > bVotes) {
      return -1;
    }
    return 0;
  };

  openModal(template: TemplateRef<any>, bucket: any, note?: any) {
    this.activeBucket = bucket;
    if (note) {
      this.activeNote = note;
    }
    this.modalRef = this.modalService.show(template, this.config);
  }

  ngOnInit() {
    let id = this.route.snapshot.paramMap.get('id');

    this.db
      .object(`/retroboards/${this.uid}/${id}`)
      .valueChanges()
      .subscribe((retroboard) => (this.retroboard = retroboard));

    this.buckets = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.db
          .list(`/buckets/${params.get('id')}`)
          .snapshotChanges()
          .pipe(
            map((actions) => {
              return actions.map((a) => ({ key: a.key, ...a.payload.val() }));
            }),
          ),
      ),
      map((buckets) => {
        return buckets.map((bucket: any) => {
          bucket.notes = this.db
            .list(`/notes/${bucket.key}`)
            .snapshotChanges()
            .pipe(
              map((actions) => {
                return actions.map((a) => ({ key: a.key, ...a.payload.val() }));
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
    this.buckets.subscribe((data) => {
      data.map((bucket) => {
        this.db
          .list(`/notes/${bucket.key}`)
          .snapshotChanges()
          .pipe(
            map((actions) =>
              actions.map((a) => ({ key: a.key, ...a.payload.val() })),
            ),
          )
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

  addNote(message: string) {
    this.db
      .list(`/notes/${this.activeBucket.key}`)
      .push({ message: message, votes: {} })
      .then(() => this.modalRef.hide());
  }

  updateNote(message: string) {
    this.db
      .object(`/notes/${this.activeBucket.key}/${this.activeNote.key}`)
      .update({ message: message })
      .then(() => this.modalRef.hide());
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
      .then(() => (this.modalRef ? this.modalRef.hide() : ''));
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
      .then(() => (this.modalRef ? this.modalRef.hide() : ''));
  }

  deleteNote() {
    this.db
      .object(`/notes/${this.activeBucket.key}/${this.activeNote.key}`)
      .remove()
      .then(() => this.modalRef.hide());
  }
}
