import { Injectable } from '@angular/core';
import { Database, ref, list, object, query, orderByChild, equalTo, push, set, remove, update, get } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import * as momentTimeZone from 'moment-timezone';
import { Retroboard, Bucket, Note, BucketTemplate } from '../types';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RetroboardService {
  constructor(private db: Database, private authService: AuthService) {}

  getRetroboards(): Observable<Retroboard[]> {
    const uid = this.authService.getUserDetails().uid;
    return list(query(ref(this.db, '/retroboards'), orderByChild('creatorId'), equalTo(uid))).pipe(
      map(changes => changes.map(c => ({ key: c.snapshot.key, ...(c.snapshot.val() as any) })))
    );
  }

  getRetroboard(id: string): Observable<Retroboard> {
    return object(ref(this.db, `/retroboards/${id}`)).pipe(
      map(change => ({ key: change.snapshot.key, ...(change.snapshot.val() as any) }))
    );
  }

  async updateRetroboard(id: string, options: { name: string; buckets: Partial<Bucket>[] }) {
    this.sendRetrospectiveEvent('update');
    await update(ref(this.db, `/retroboards/${id}`), { name: options.name });

    if (options.buckets) {
      for (const bucket of options.buckets) {
        await update(ref(this.db, `/buckets/${bucket.key}`), { name: bucket.name });
      }
    }
  }

  async deleteRetroboard(retroboard: Retroboard) {
    this.sendRetrospectiveEvent('delete');
    const notesSnapshot = await get(query(ref(this.db, '/notes'), orderByChild('retroboardId'), equalTo(retroboard.key)));
    notesSnapshot.forEach(child => {
      remove(ref(this.db, `/notes/${child.key}`));
    });
    const bucketsSnapshot = await get(query(ref(this.db, '/buckets'), orderByChild('retroboardId'), equalTo(retroboard.key)));
    bucketsSnapshot.forEach(child => {
      remove(ref(this.db, `/buckets/${child.key}`));
    });
    await remove(ref(this.db, `/retroboards/${retroboard.key}`));
  }

  async createRetroboard(name: string, bucketNames: string[] = []) {
    try {
      this.sendRetrospectiveEvent('create');
      const userDetails = this.authService.getUserDetails();
      const appUser = await this.authService.getAppUser();
      const retroboardName = name && name.length > 0 ? name : moment().format('dddd, MMMM Do YYYY');
      const result = await push(ref(this.db, '/retroboards'), {
        creator: appUser.displayName,
        creatorId: userDetails.uid,
        noteCount: 0,
        name: retroboardName,
        dateCreated: moment().format('YYYY/MM/DD HH:mm:ss'),
        timeZone: momentTimeZone.tz.guess(),
      });
      const retroboardId = result.key;
      for (const bucketName of bucketNames) {
        await push(ref(this.db, '/buckets'), {
          name: bucketName,
          retroboardId,
          creator: appUser.displayName,
          creatorId: userDetails.uid,
        });
      }
      return retroboardId;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getBucketTemplates(): Observable<BucketTemplate[]> {
    const uid = this.authService.getUserDetails().uid;
    return list(query(ref(this.db, '/bucketTemplates'), orderByChild('creatorId'), equalTo(uid))).pipe(
      map(changes => changes.map(c => ({ key: c.snapshot.key, ...(c.snapshot.val() as any) })))
    );
  }

  async saveBucketTemplate(name: string, bucketNames: string[]) {
    const uid = this.authService.getUserDetails().uid;
    return push(ref(this.db, '/bucketTemplates'), { name, bucketNames, creatorId: uid });
  }

  async deleteBucketTemplate(templateId: string) {
    return remove(ref(this.db, `/bucketTemplates/${templateId}`));
  }

  private sendRetrospectiveEvent(eventName: string) {
    (<any>window).gtag('event', eventName, {
      event_category: 'retrospective',
      event_label: 'origin',
    });
  }
}
