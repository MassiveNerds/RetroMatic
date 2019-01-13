import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import * as momentTimeZone from 'moment-timezone';

@Injectable({
  providedIn: 'root'
})
export class RetroboardService {
  user: Observable<firebase.User>;
  userChanges: Subscription;
  uid: string;
  retroboards: AngularFireList<any>;
  $retroboards: any;

  constructor(private db: AngularFireDatabase, public afAuth: AngularFireAuth) {
    this.user = afAuth.authState;
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

  getRetroboards() {
    return this.$retroboards;
  }

  async updateRetroboard(id: string, options: {name: string, buckets?: {name: string, key?: string}[]}) {
    this.db
    .object(`/retroboards/${this.uid}/${id}`)
      .update({ name: options.name });

    if (options.buckets) {
      options.buckets.forEach(bucket => {
        this.db
          .object(`/buckets/${id}/${bucket.key}`)
          .update({ name: bucket.name });
      });
    }
  }

  async createRetroboard(name: string, bucketNames: string[] = []) {
    const result = await this.retroboards
      .push({
        name: name && name.length > 0
          ? name : moment().format('dddd, MMMM Do YYYY'),
        dateCreated: moment().format('YYYY/MM/DD HH:mm'),
        timeZone: momentTimeZone.tz.guess(),
      });
    const newId = result.key;
    const buckets: AngularFireList<any> = this.db.list(`/buckets/${newId}`);
    bucketNames.forEach(bucketName => {
      buckets.push({ name: bucketName });
    });
    return newId;
  }
}
