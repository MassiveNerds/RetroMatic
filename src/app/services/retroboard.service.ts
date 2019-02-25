import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import * as momentTimeZone from 'moment-timezone';
import { Retroboard, Bucket } from '../types';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RetroboardService {

  constructor(private db: AngularFireDatabase, private authService: AuthService) { }

  getRetroboards(): Observable<Retroboard[]> {
    const uid = this.authService.getUserDetails().uid;
    return this.db.list<Retroboard>(`/retroboards/${uid}`).snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map(a => ({ key: a.key, ...a.payload.val() })),
        ),
      );
  }

  getRetroboard(id: string): Observable<Retroboard> {
    const uid = this.authService.getUserDetails().uid;
    return this.db.object<Retroboard>(`/retroboards/${uid}/${id}`).snapshotChanges()
      .pipe(
        map((snapshot) => {
          return { key: snapshot.key, ...snapshot.payload.val() };
        }),
      );
  }

  async updateRetroboard(id: string, options: { name: string, buckets?: Bucket[] }) {
    const uid = this.authService.getUserDetails().uid;
    this.db.object(`/retroboards/${uid}/${id}`).update({ name: options.name });

    if (options.buckets) {
      options.buckets.forEach(bucket => {
        this.db.object(`/buckets/${id}/${bucket.key}`).update({ name: bucket.name });
      });
    }
  }

  async doDeleteRetro(buckets: Bucket[], retroboard: Retroboard, user: firebase.User) {
    return new Promise<any>((resolve, reject) => {
      this.sendRetrospectiveEvent('delete');
      Promise.all(
        buckets.map((bucket) =>
          this.db.object(`/notes/${bucket.key}`).remove(),
        ),
      )
        .then(() =>
          this.db.object(`/buckets/${retroboard.key}`).remove(),
        )
        .then(() =>
          this.db
            .object(`/retroboards/${user.uid}/${retroboard.key}`)
            .remove(),
        ).then(result => {
          resolve(result);
        }, error => reject(error));
    });
  }

  async createRetroboard(name: string, bucketNames: string[] = []) {
    const uid = this.authService.getUserDetails().uid;
    const retroboardName = (name && name.length > 0) ? name : moment().format('dddd, MMMM Do YYYY');
    const result = await this.db.list<Retroboard>(`/retroboards/${uid}`)
      .push({
        name: retroboardName,
        dateCreated: moment().format('YYYY/MM/DD HH:mm'),
        timeZone: momentTimeZone.tz.guess()
      });
    const newId = result.key;
    const buckets: AngularFireList<any> = this.db.list(`/buckets/${newId}`);
    bucketNames.forEach(name => {
      buckets.push({ name });
    });
    return newId;
  }

  private sendRetrospectiveEvent(eventName: string) {
    (<any>window).gtag('event', eventName, {
      'event_category': 'retrospective',
      'event_label': 'origin'
    });
  }
}
