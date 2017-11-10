import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import * as moment from 'moment';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  user: Observable<firebase.User>;
  uid: string;
  retroboards: FirebaseListObservable<any[]>;
  constructor(private db: AngularFireDatabase, public afAuth: AngularFireAuth) {
    this.user = afAuth.authState;
    this.user.subscribe(result => this.uid = result.uid);
  }

  ngOnInit() {
    this.retroboards = this.db.list(`/retroboards/${this.uid}`)
  }
  createRetroboard() {
    this.retroboards.push({ name: moment().format('dddd, MMMM Do YYYY') }).then(result => {
      const newId = result.key;
      const buckets: FirebaseListObservable<any[]> = this.db.list(`/buckets/${newId}`);
      buckets.push({ name: 'What went well?', type: 'success' });
      buckets.push({ name: 'What can be improved?', type: 'danger' });
      buckets.push({ name: 'Action items', type: 'info' });
    });
  }
}
