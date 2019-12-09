import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef, PageEvent } from '@angular/material';
import { CreateUpdateRetroModalComponent } from '../create-update-retro-modal/create-update-retro-modal.component';
import { RetroboardService } from '../../services/retroboard.service';
import { Retroboard } from '../../types/Retroboard';
import { Subscription, Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { User } from '../../types';
import { AngularFireDatabase } from '@angular/fire/database';

@Component({
  selector: 'app-my-dashboard',
  templateUrl: './my-dashboard.component.html',
  styleUrls: ['./my-dashboard.component.scss'],
})
export class MyDashboardComponent implements OnInit, OnDestroy {

  retroboards: Retroboard[];
  total: number;
  dialogRef: MatDialogRef<any>;
  retroboardSubscription: Subscription;
  userSubscription: Subscription;
  pageSize = 5;
  pageSizeOptions = [5, 10, 25, 100];
  pageIndex = 0;
  displayName: string;

  constructor(
    public dialog: MatDialog,
    private retroboardService: RetroboardService,
    private db: AngularFireDatabase,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.getRetroboards();
    const userDetails = this.authService.getUserDetails();
    this.userSubscription = this.db.object<User>(`/users/${userDetails.uid}`).valueChanges().subscribe(user => {
      this.displayName = user.displayName;
    });
  }

  ngOnDestroy() {
    this.retroboardSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

  getRetroboards() {
    this.retroboardSubscription = this.retroboardService.getRetroboards()
      .subscribe(retroboards => {
        this.total = retroboards.length;
        const mutableRetroboards = [...retroboards].sort((a, b) => {
          return new Date(b.dateCreated || 0).getTime() - new Date(a.dateCreated || 0).getTime();
        });
        const start = this.pageIndex * this.pageSize;
        const end = start + this.pageSize;
        this.retroboards = mutableRetroboards.slice(start, end);
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
}
