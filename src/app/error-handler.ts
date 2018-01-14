import { BrowserModule } from '@angular/platform-browser';
import { Component, ErrorHandler, NgModule, Injectable, Injector } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/modal-options.class';

@Injectable()
export class UIErrorHandler extends ErrorHandler {
  bsModalRef: BsModalRef;
  constructor(private injector: Injector) {
    super();
  }
  handleError(error) {
    super.handleError(error);
    this.openModal(error);
  }

  openModal(error: any) {
    const modalService = this.injector.get(BsModalService);
    const list = [
      'Open a modal with component',
      'Pass your data',
      'Do something else',
      '...'
    ];
    this.bsModalRef = modalService.show(ModalContentComponent);
    this.bsModalRef.content.title = `Whoops!`;
    this.bsModalRef.content.message = error.message;
  }
}

@Component({
  selector: 'modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title pull-left">{{title}}</h4>
      <button type="button" class="close pull-right" aria-label="Close" (click)="bsModalRef.hide()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p>{{message}}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-default" (click)="bsModalRef.hide()">Close</button>
    </div>
  `
})
export class ModalContentComponent {
  title: string;
  message: string;
  constructor(public bsModalRef: BsModalRef) { }
}