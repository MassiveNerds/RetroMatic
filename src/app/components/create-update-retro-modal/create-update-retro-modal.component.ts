import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RetroboardService } from '../../services/retroboard.service';
import { Router } from '@angular/router';
import { Bucket } from '../../types';

const DEFAULT_BUCKETS = [{ name: 'What went well?' }, { name: 'What can be improved?' }, { name: 'Action items' }];

@Component({
  selector: 'app-create-update-retro-modal',
  templateUrl: './create-update-retro-modal.component.html',
  styleUrls: ['./create-update-retro-modal.component.scss'],
})
export class CreateUpdateRetroModalComponent implements OnInit {
  isUpdate: boolean;
  retroboardName = '';
  buckets: Partial<Bucket>[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    public dialogRef: MatDialogRef<CreateUpdateRetroModalComponent>,
    private retroboardService: RetroboardService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.data) {
      this.isUpdate = true;
      this.retroboardName = this.data.retroboard.name;
      this.buckets = this.data.buckets;
    } else {
      this.buckets = DEFAULT_BUCKETS;
    }
  }

  createRetroboard() {
    this.retroboardService
      .createRetroboard(
        this.retroboardName,
        this.buckets.map(bucket => bucket.name)
      )
      .then(id => {
        this.dialogRef.close();
        this.router.navigate(['/retroboard/', id]);
      });
  }

  updateRetroboard() {
    this.retroboardService
      .updateRetroboard(this.data.retroboard.key, {
        name: this.retroboardName,
        buckets: this.buckets,
      })
      .then(() => {
        this.dialogRef.close();
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
