import {
  Component,
  ErrorHandler,
  NgModule,
  Injectable,
  Injector,
  Inject,
} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface DialogData {
  title: string;
  message: string;
}

@Injectable()
export class UIErrorHandler extends ErrorHandler {
  constructor(public dialog: MatDialog, private injector: Injector) {
    super();
  }
  handleError(error) {
    super.handleError(error);
    this.openModal(error);
  }

  openModal(error: any) {
    const dialogRef = this.dialog.open(ModalContentComponent, {
      data: { title: 'Whoops!', message: error.message },
    });
  }
}

@Component({
  selector: 'app-modal-content-component',
  template: `
    <div mat-dialog-title>{{data.title}}</div>
    <div mat-dialog-content>
      <p>{{data.message}}</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </div>
  `,
})
export class ModalContentComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}
}
