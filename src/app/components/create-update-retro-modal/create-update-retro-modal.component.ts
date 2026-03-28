import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetroboardService } from '../../services/retroboard.service';
import { Router } from '@angular/router';
import { Bucket, BucketTemplate } from '../../types';

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
  templates: BucketTemplate[] = [];
  selectedTemplate: BucketTemplate | null = null;
  showSaveTemplate = false;
  templateName = '';

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
      this.buckets = DEFAULT_BUCKETS.map(b => ({ ...b }));
      this.retroboardService.getBucketTemplates().subscribe(templates => {
        this.templates = templates;
      });
    }
  }

  applyTemplate(template: BucketTemplate) {
    this.buckets = template.bucketNames.map(name => ({ name }));
  }

  saveTemplate() {
    if (!this.templateName.trim()) return;
    this.retroboardService
      .saveBucketTemplate(this.templateName.trim(), this.buckets.map(b => b.name))
      .then(() => {
        this.templateName = '';
        this.showSaveTemplate = false;
      });
  }

  deleteTemplate(template: BucketTemplate, event: Event) {
    event.stopPropagation();
    this.retroboardService.deleteBucketTemplate(template.key).then(() => {
      if (this.selectedTemplate && this.selectedTemplate.key === template.key) {
        this.selectedTemplate = null;
      }
    });
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
