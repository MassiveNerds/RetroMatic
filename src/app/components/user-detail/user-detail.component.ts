import { Component, OnInit, TemplateRef } from '@angular/core';
import { AngularFireList } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { RetroBoardDetailsModalComponent } from '../retro-board-details-modal/retro-board-details-modal.component';
import { RetroboardService } from '../retro-board/retroboard.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  error: Error;
  user: Observable<firebase.User>;
  userChanges: Subscription;
  uid: string;
  retroboards: AngularFireList<any>;
  $retroboards: any;
  config = {
    animated: true,
    keyboard: true,
    backdrop: true,
    ignoreBackdropClick: false,
  };
  dialogRef;

  constructor(
    public dialog: MatDialog,
    private retroboardService: RetroboardService,
  ) {}

  ngOnInit() {
    this.$retroboards = this.retroboardService.getRetroboards();
  }

  openModal(template: TemplateRef<any>) {
    this.dialogRef = this.dialog.open(template, {
      panelClass: 'custom-dialog-container',
    });
  }

  openRetroBoardDetailsModal() {
    this.dialogRef = this.dialog.open(RetroBoardDetailsModalComponent, {
      panelClass: 'custom-dialog-container',
    });
  }
}
