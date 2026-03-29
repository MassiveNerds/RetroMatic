import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Retroboard } from '../../types';

@Component({
  standalone: false,
  selector: 'app-sidebar',
  template: '<nav class="sidebar-stub"></nav>',
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() currentRetroboard: Retroboard | null = null;
  @Output() toggleCollapse = new EventEmitter<void>();
}
