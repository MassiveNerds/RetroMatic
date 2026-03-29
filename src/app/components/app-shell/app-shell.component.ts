import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RetroStateService } from '../../services/retro-state.service';
import { Retroboard } from '../../types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  standalone: false,
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
})
export class AppShellComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  currentRetroboard: Retroboard | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private retroStateService: RetroStateService,
  ) {}

  ngOnInit() {
    this.retroStateService.retroboard$
      .pipe(takeUntil(this.destroy$))
      .subscribe(retro => (this.currentRetroboard = retro));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
