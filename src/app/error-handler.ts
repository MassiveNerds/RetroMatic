import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule, Injectable} from '@angular/core';

@Injectable()
export class UIErrorHandler extends ErrorHandler {
  constructor() {
    super();
  }
  handleError(error) {
    super.handleError(error);
    alert(`Error occurred: ${error.message}`);
  }
}
