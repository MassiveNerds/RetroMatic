import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Retroboard } from '../types';

@Injectable({ providedIn: 'root' })
export class RetroStateService {
  private _retroboard = new BehaviorSubject<Retroboard | null>(null);
  readonly retroboard$ = this._retroboard.asObservable();

  setRetroboard(retro: Retroboard | null): void {
    this._retroboard.next(retro);
  }
}
