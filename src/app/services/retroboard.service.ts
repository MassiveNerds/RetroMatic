import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import * as momentTimeZone from 'moment-timezone';
import { Retroboard, Bucket, Note } from '../types';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RetroboardService {

  constructor(private db: AngularFireDatabase, private authService: AuthService) { }

  getRetroboards(): Observable<Retroboard[]> {
    const uid = this.authService.getUserDetails().uid;
    return this.db.list<Retroboard>(`/retroboards`, ref => ref.orderByChild('creatorId').equalTo(uid)).snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map(a => ({ key: a.key, ...a.payload.val() })),
        ),
      );
  }

  getRetroboard(id: string): Observable<Retroboard> {
    return this.db.object<Retroboard>(`/retroboards/${id}`).snapshotChanges()
      .pipe(
        map((snapshot) => {
          return { key: snapshot.key, ...snapshot.payload.val() };
        }),
      );
  }

  async updateRetroboard(id: string, options: { name: string, buckets: Partial<Bucket>[] }) {
    this.sendRetrospectiveEvent('update');
    this.db.object(`/retroboards/${id}`).update({ name: options.name });

    if (options.buckets) {
      options.buckets.forEach(bucket => {
        this.db.object(`/buckets/${bucket.key}`).update({ name: bucket.name });
      });
    }
  }

  async deleteRetroboard(retroboard: Retroboard) {
    this.sendRetrospectiveEvent('delete');
    this.db.list<Note>('/notes', ref => ref.orderByChild('retroboardId').equalTo(retroboard.key))
      .snapshotChanges().subscribe(snapshots => {
        snapshots.forEach(async (snapshot) => {
          await this.db.object<Note>(`/notes/${snapshot.key}`).remove();
        });
      });
    this.db.list<Bucket>('/buckets', ref => ref.orderByChild('retroboardId').equalTo(retroboard.key))
      .snapshotChanges().subscribe(snapshots => {
        snapshots.forEach(async (snapshot) => {
          await this.db.object<Bucket>(`/buckets/${snapshot.key}`).remove();
        });
      });
    await this.db.object<Retroboard>(`/retroboards/${retroboard.key}`).remove();
  }

  async createRetroboard(name: string, bucketNames: string[] = []) {
    try {
      this.sendRetrospectiveEvent('create');
      const userDetails = this.authService.getUserDetails();
      const appUser = this.authService.getAppUser();
      const retroboardName = (name && name.length > 0) ? name : moment().format('dddd, MMMM Do YYYY');
      const result = await this.db.list<Retroboard>(`/retroboards`)
        .push({
          creator: appUser.displayName,
          creatorId: userDetails.uid,
          noteCount: 0,
          name: retroboardName,
          dateCreated: moment().format('YYYY/MM/DD HH:mm:ss'),
          timeZone: momentTimeZone.tz.guess()
        });
      const retroboardId = result.key;
      const buckets: AngularFireList<Bucket> = this.db.list(`/buckets`);
      bucketNames.forEach(bucketName => {
        buckets.push({
          name: bucketName,
          retroboardId,
          creator: appUser.displayName,
          creatorId: userDetails.uid,
        });
      });
      return retroboardId;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private sendRetrospectiveEvent(eventName: string) {
    (<any>window).gtag('event', eventName, {
      'event_category': 'retrospective',
      'event_label': 'origin'
    });
  }
}
