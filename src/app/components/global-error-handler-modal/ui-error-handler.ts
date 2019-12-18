import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material';
import { GlobalErrorHandlerModalComponent } from './global-error-handler-modal.component';

@Injectable()
export class UIErrorHandler extends ErrorHandler {
  constructor(public dialog: MatDialog, private zone: NgZone) {
    super();
  }

  handleError(error: Error) {
    super.handleError(error);

    this.zone.run(() => {
      this.dialog.open(GlobalErrorHandlerModalComponent, {
        data: { title: 'Whoops!', message: error.message },
      });
    });
  }
}
