import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { RetroboardService } from '../retro-board/retroboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-retro-board-details-modal',
  templateUrl: './retro-board-details-modal.component.html',
  styleUrls: ['./retro-board-details-modal.component.scss']
})
export class RetroBoardDetailsModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<RetroBoardDetailsModalComponent>,
    private retroboardService: RetroboardService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  createRetroboard(name: string,
    bucket1: string,
    bucket2: string,
    bucket3: string) {
      this.retroboardService.createRetroboard(name)
      .then((id) => {
        this.dialogRef.close();
        this.router.navigate(['/retroboard/', id]);
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

}
