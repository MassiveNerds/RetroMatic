import { Component, OnInit, TemplateRef } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';
import {Router} from '@angular/router';
import * as firebase from 'firebase/app';
import * as moment from 'moment';

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

  constructor(private db: AngularFireDatabase, public afAuth: AngularFireAuth, private modalService: BsModalService, private router: Router) {
    this.user = afAuth.authState;
    this.user.subscribe(result => this.uid = result.uid);
  }

  ngOnInit() {
    this.retroboards = this.db.list(`/retroboards/${this.uid}`)
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.config);
  }

  createRetroboard(name: string, bucket1: string, bucket2: string, bucket3: string, hasTimer: boolean) {
    this.retroboards.push({ name: (name && name.length > 0) ? name : moment().format('dddd, MMMM Do YYYY'), hasTimer: hasTimer }).then(result => {
      const newId = result.key;
      const buckets: FirebaseListObservable<any[]> = this.db.list(`/buckets/${newId}`);
      buckets.push({ name: (bucket1 && bucket1.length > 0) ? bucket1 : 'What went well?', type: 'success' });
      buckets.push({ name: (bucket2 && bucket2.length > 0) ? bucket2 : 'What can be improved?', type: 'danger' });
      buckets.push({ name: (bucket3 && bucket3.length > 0) ? bucket3 : 'Action items', type: 'info' });
      return newId;
    }).then((id) => {
      this.modalRef.hide();
      this.router.navigate(['/retroboard/', id]);
    });
  }
}
