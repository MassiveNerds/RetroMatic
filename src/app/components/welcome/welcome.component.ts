import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateUpdateRetroModalComponent } from '../create-update-retro-modal/create-update-retro-modal.component';

@Component({
  standalone: false,
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent {
  constructor(private dialog: MatDialog) {}

  createRetro() {
    this.dialog.open(CreateUpdateRetroModalComponent, {
      panelClass: 'custom-dialog-container',
    });
  }
}
