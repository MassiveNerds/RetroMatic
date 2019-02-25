import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { RetroboardDetailsModalComponent } from '../retro-board-details-modal/retro-board-details-modal.component';
import { RetroboardService } from '../../services/retroboard.service';
import { Retroboard } from '../../types/retroboard';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit, OnDestroy {
  private retroboards: Retroboard[];
  private dialogRef: MatDialogRef<any>;
  private subscription: Subscription;

  constructor(
    public dialog: MatDialog,
    private retroboardService: RetroboardService,
  ) { }

  ngOnInit() {
    this.getRetroboards();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getRetroboards() {
    this.subscription = this.retroboardService.getRetroboards()
      .subscribe(retroboards => this.retroboards = retroboards);
  }

  openModal(template: TemplateRef<any>) {
    this.dialogRef = this.dialog.open(template, {
      panelClass: 'custom-dialog-container',
    });
  }

  openRetroBoardDetailsModal() {
    this.dialogRef = this.dialog.open(RetroboardDetailsModalComponent, {
      panelClass: 'custom-dialog-container',
    });
  }
}
