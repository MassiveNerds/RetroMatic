import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface DialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-global-error-handler-modal',
  templateUrl: './global-error-handler-modal.component.html',
  styleUrls: ['./global-error-handler-modal.component.scss'],
})
export class GlobalErrorHandlerModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: DialogData,
    public dialogRef: MatDialogRef<GlobalErrorHandlerModalComponent>
  ) {}
}
