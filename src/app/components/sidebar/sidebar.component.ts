import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Database, ref, list, get, set, query, orderByChild, equalTo } from '@angular/fire/database';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { RetroboardService } from '../../services/retroboard.service';
import { RetroStateService } from '../../services/retro-state.service';
import { ExportService } from '../../services/export.service';
import { Retroboard } from '../../types';
import { CreateUpdateRetroModalComponent } from '../create-update-retro-modal/create-update-retro-modal.component';
import { ExportDialogComponent } from '../export-dialog/export-dialog.component';

@Component({
  standalone: false,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  @Input() currentRetroboard: Retroboard | null = null;
  @Output() toggleCollapse = new EventEmitter<void>();

  retroboards: Retroboard[] = [];
  favorites: Retroboard[] = [];
  userDetails: any;

  private destroy$ = new Subject<void>();
  private retroSub: Subscription;
  private favSub: Subscription;

  constructor(
    public authService: AuthService,
    private retroboardService: RetroboardService,
    private retroStateService: RetroStateService,
    private exportService: ExportService,
    private db: Database,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.user$
      .pipe(filter(u => u != null), take(1))
      .subscribe(user => {
        this.userDetails = { uid: user.uid, email: user.email };
        this.loadRetroboards();
        this.loadFavorites();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.retroSub) { this.retroSub.unsubscribe(); }
    if (this.favSub) { this.favSub.unsubscribe(); }
  }

  get isOwner(): boolean {
    return !!this.currentRetroboard &&
      !!this.userDetails &&
      this.currentRetroboard.creatorId === this.userDetails.uid;
  }

  get hasRetroOpen(): boolean {
    return this.currentRetroboard !== null;
  }

  get isCurrentFavorite(): boolean {
    if (!this.currentRetroboard) return false;
    return this.favorites.some(f => f.key === this.currentRetroboard.key);
  }

  loadRetroboards() {
    this.retroSub = this.retroboardService.getRetroboards()
      .pipe(takeUntil(this.destroy$))
      .subscribe(retros => {
        this.retroboards = [...retros].sort(
          (a, b) => new Date(b.dateCreated || 0).getTime() - new Date(a.dateCreated || 0).getTime()
        );
      });
  }

  async loadFavorites() {
    const snap = await get(ref(this.db, `/users/${this.userDetails.uid}/favorites`));
    const idx: { [key: string]: boolean } = snap.val() || {};
    const favKeys = Object.keys(idx).filter(k => idx[k]);
    if (this.favSub) { this.favSub.unsubscribe(); }
    this.favSub = list(ref(this.db, '/retroboards'))
      .pipe(
        map(changes => changes.map(c => ({ key: c.snapshot.key, ...(c.snapshot.val() as any) }))),
        takeUntil(this.destroy$)
      )
      .subscribe(all => {
        this.favorites = all.filter(r => favKeys.includes(r.key));
      });
  }

  openCreateModal() {
    this.dialog.open(CreateUpdateRetroModalComponent, {
      panelClass: 'custom-dialog-container',
    });
  }

  navigateTo(key: string) {
    this.router.navigate(['/app/retro', key]);
  }

  async toggleFavorite() {
    if (!this.currentRetroboard || !this.userDetails) return;
    const favRef = ref(this.db, `/users/${this.userDetails.uid}/favorites/${this.currentRetroboard.key}`);
    const snap = await get(favRef);
    await set(favRef, snap.exists() ? !snap.val() : true);
    this.loadFavorites();
  }

  openExport() {
    if (!this.currentRetroboard) return;
    const data = this.retroStateService.exportData;
    const html = data
      ? this.exportService.export(data)
      : '<p>No notes to export yet.</p>';
    this.dialog.open(ExportDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: { html },
    });
  }

  async openEdit() {
    if (!this.currentRetroboard) return;
    const snapshot = await get(
      query(ref(this.db, '/buckets'), orderByChild('retroboardId'), equalTo(this.currentRetroboard.key))
    );
    const buckets: any[] = [];
    snapshot.forEach(child => {
      buckets.push({ key: child.key, ...child.val() });
    });
    this.dialog.open(CreateUpdateRetroModalComponent, {
      panelClass: 'custom-dialog-container',
      data: { retroboard: this.currentRetroboard, buckets },
    });
  }

  openDelete() {
    if (!this.currentRetroboard || !this.isOwner) return;
    const confirmed = window.confirm(`Delete "${this.currentRetroboard.name}"? This cannot be undone.`);
    if (confirmed) {
      this.retroboardService.deleteRetroboard(this.currentRetroboard)
        .then(() => this.router.navigate(['/app']));
    }
  }
}
