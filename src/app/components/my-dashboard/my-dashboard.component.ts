import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { CreateUpdateRetroModalComponent } from '../create-update-retro-modal/create-update-retro-modal.component';
import { RetroboardService } from '../../services/retroboard.service';
import { Retroboard } from '../../types/Retroboard';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../types';
import { Database, ref, list, objectVal, query, orderByChild, equalTo, get } from '@angular/fire/database';
import { filter, map, take } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-my-dashboard',
  templateUrl: './my-dashboard.component.html',
  styleUrls: ['./my-dashboard.component.scss'],
})
export class MyDashboardComponent implements OnInit, OnDestroy {
  retroboards: Retroboard[];
  favorites: Retroboard[];
  total: number;
  dialogRef: MatDialogRef<any>;
  retroboardSubscription: Subscription;
  favoritesSubscription: Subscription;
  userSubscription: Subscription;
  pageSize = 5;
  pageSizeOptions = [5, 10, 25, 100];
  pageIndex = 0;
  displayName: string;
  userDetails: any;
  favoritesTotal: number;
  favoritesPageSize = 5;
  favoritesPageSizeOptions = [5, 10, 25, 100];
  favoritesPageIndex = 0;

  constructor(
    public dialog: MatDialog,
    private retroboardService: RetroboardService,
    private db: Database,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.user$.pipe(
        filter(user => user != null),
        take(1)
      )
      .subscribe(firebaseUser => {
        this.userDetails = firebaseUser;
        this.getRetroboards();
        this.getFavorites();
        objectVal<User>(ref(this.db, `/users/${firebaseUser.uid}`)).pipe(take(1))
          .subscribe(user => {
            if (!user) {
              this.authService.logout();
              return;
            }
            this.displayName = user.displayName;
          });
      });
  }

  ngOnDestroy() {
    this.retroboardSubscription.unsubscribe();
    this.favoritesSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  getRetroboards() {
    this.retroboardSubscription = this.retroboardService.getRetroboards().subscribe(retroboards => {
      this.total = retroboards.length;
      const mutableRetroboards = [...retroboards].sort((a, b) => {
        return new Date(b.dateCreated || 0).getTime() - new Date(a.dateCreated || 0).getTime();
      });
      const start = this.pageIndex * this.pageSize;
      const end = start + this.pageSize;
      this.retroboards = mutableRetroboards.slice(start, end);
    });
  }

  async getFavorites() {
    const dataSnapshot = await get(ref(this.db, `/users/${this.userDetails.uid}/favorites`));
    const favoritesIndex: { [key: string]: boolean } = dataSnapshot.val() || {};
    const favorites = Object.keys(favoritesIndex).filter(key => favoritesIndex[key]);
    this.favoritesSubscription = list(ref(this.db, '/retroboards')).pipe(
        map(changes => changes.map(c => ({ key: c.snapshot.key, ...(c.snapshot.val() as any) })))
      )
      .subscribe(retroboards => {
        const favoriteRetroboards = retroboards.filter(retroboard => favorites.includes(retroboard.key));
        this.favoritesTotal = favoriteRetroboards.length;
        const mutableFavorites = [...favoriteRetroboards].sort((a, b) => {
          return new Date(b.dateCreated || 0).getTime() - new Date(a.dateCreated || 0).getTime();
        });
        const start = this.favoritesPageIndex * this.favoritesPageSize;
        const end = start + this.favoritesPageSize;
        this.favorites = mutableFavorites.slice(start, end);
      });
  }

  openModal(template: TemplateRef<any>) {
    this.dialogRef = this.dialog.open(template, {
      panelClass: 'custom-dialog-container',
    });
  }

  openRetroBoardDetailsModal() {
    this.dialogRef = this.dialog.open(CreateUpdateRetroModalComponent, {
      panelClass: 'custom-dialog-container',
    });
  }

  handlePaginatorData(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.getRetroboards();
  }

  handleFavoritesPaginatorData(event: PageEvent) {
    this.favoritesPageSize = event.pageSize;
    this.favoritesPageIndex = event.pageIndex;
    this.getFavorites();
  }
}
