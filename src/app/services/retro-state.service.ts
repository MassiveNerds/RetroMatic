import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Retroboard } from '../types';

@Injectable({ providedIn: 'root' })
export class RetroStateService {
  private _retroboard = new BehaviorSubject<Retroboard | null>(null);
  readonly retroboard$ = this._retroboard.asObservable();

  private _exportData = new BehaviorSubject<Object | null>(null);

  setRetroboard(retro: Retroboard | null): void {
    this._retroboard.next(retro);
  }

  get exportData(): Object | null {
    return this._exportData.getValue();
  }

  setExportData(data: Object | null): void {
    this._exportData.next(data);
  }
}
