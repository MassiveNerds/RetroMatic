import { Component, OnInit, TemplateRef } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import { Router } from '@angular/router';
import * as moment from 'moment';
import * as firebase from 'firebase/app';
import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.less'],
})
export class UserDetailComponent implements OnInit {
  user: Observable<firebase.User>;
  userChanges: Subscription;
  uid: string;
  retroboards: AngularFireList<any>;
  $retroboards: any;
  modalRef: BsModalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: false,
  };

  constructor(
    private db: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    private modalService: BsModalService,
    private router: Router,
  ) {
    this.user = afAuth.authState;
  }

  ngOnInit() {
    this.userChanges = this.user.subscribe((user) => {
      this.uid = user.uid;
      this.retroboards = this.db.list(`/retroboards/${this.uid}`);
      this.$retroboards = this.retroboards
        .snapshotChanges()
        .pipe(
          map((actions) =>
            actions.map((a) => ({ key: a.key, ...a.payload.val() })),
          ),
        );
    });
  }

  ngOnDestroy() {
    this.userChanges.unsubscribe();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.config);
  }

  createRetroboard(
    name: string,
    bucket1: string,
    bucket2: string,
    bucket3: string,
    hasTimer: boolean,
  ) {
    this.retroboards
      .push({
        name:
          name && name.length > 0
            ? name
            : moment().format('dddd, MMMM Do YYYY'),
        hasTimer: hasTimer,
      })
      .then((result) => {
        const newId = result.key;
        const buckets: AngularFireList<any> = this.db.list(`/buckets/${newId}`);
        buckets.push({
          name: bucket1 && bucket1.length > 0 ? bucket1 : 'What went well?',
          type: 'success',
        });
        buckets.push({
          name:
            bucket2 && bucket2.length > 0 ? bucket2 : 'What can be improved?',
          type: 'danger',
        });
        buckets.push({
          name: bucket3 && bucket3.length > 0 ? bucket3 : 'Action items',
          type: 'info',
        });
        return newId;
      })
      .then((id) => {
        this.modalRef.hide();
        this.router.navigate(['/retroboard/', id]);
      });
  }
}
