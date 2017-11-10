import { Component, OnInit, TemplateRef } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import {BsModalService} from 'ngx-bootstrap/modal';
import {BsModalRef} from 'ngx-bootstrap/modal/modal-options.class';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.less']
})
export class UserDetailComponent implements OnInit {
  user: Observable<firebase.User>;
  uid: string;
  retroboards: FirebaseListObservable<any[]>;
  modalRef: BsModalRef;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: false
  };
  addbox: any;
  constructor(private db: AngularFireDatabase, public afAuth: AngularFireAuth, private modalService: BsModalService,) {
    this.user = afAuth.authState;
    this.user.subscribe(result => this.uid = result.uid);
  }

  ngOnInit() {
    this.retroboards = this.db.list(`/retroboards/${this.uid}`)
  }

  openModal(template: TemplateRef<any>, bucket: any, note?: any) {
    this.addbox = bucket;
    if (note) {
      this.addbox = note;
    }
    this.modalRef = this.modalService.show(template, this.config);
  }

  createRetroboard(message: string) {
    this.retroboards.push({name: message}).then(result => {
      const newId = result.key;
      const buckets: FirebaseListObservable<any[]> = this.db.list(`/buckets/${newId}`);
      buckets.push({ name: 'What went well?', type: 'success' });
      buckets.push({ name: 'What can be improved?', type: 'danger' });
      buckets.push({ name: 'Action items', type: 'info' });
    }).then(() => this.modalRef.hide());
  }
}
