import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  standalone: false,
  selector: 'app-export-dialog',
  template: `
    <mat-card>
      <mat-card-header style="display:flex;flex-direction:row;justify-content:space-between;align-items:flex-start;">
        <h2 mat-dialog-title>Export HTML</h2>
        <button mat-icon-button mat-dialog-close><mat-icon>close</mat-icon></button>
      </mat-card-header>
      <mat-card-content>
        <div id="html-container" [innerHTML]="data.html"></div>
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button mat-dialog-close>Close</button>
        <button mat-raised-button color="primary" (click)="copy()">Copy to Clipboard</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    #html-container {
      border: 1px solid var(--mat-sys-surface-variant);
      border-radius: 4px;
      overflow: auto;
      height: 250px;
      font-size: 13px;
    }
  `],
})
export class ExportDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { html: string }) {}

  copy() {
    const el = document.getElementById('html-container');
    if (!el || !window.getSelection) return;
    const range = document.createRange();
    range.selectNode(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
  }
}
