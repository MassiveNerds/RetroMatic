import {
  Component,
  ContentChildren,
  Input,
  QueryList,
  AfterContentInit,
} from '@angular/core';
import { TransitionGroupItemDirective } from '../../directives/transition-group-item.directive';

@Component({
  selector: 'app-transition-group',
  templateUrl: './transition-group.component.html',
  styleUrls: ['./transition-group.component.scss']
})
export class TransitionGroupComponent implements AfterContentInit {

  @Input() class: string;

  @ContentChildren(TransitionGroupItemDirective) items: QueryList<TransitionGroupItemDirective>;
  currentCount: number;

  ngAfterContentInit() {
    this.currentCount = this.items.length;
    this.refreshPosition('prevPos');
    this.items.changes.subscribe(items => {
      if (items.length !== this.currentCount) {
        this.currentCount = items.length;
        this.refreshPosition('prevPos');
      }
      items.forEach(item => {
        item.prevPos = item.newPos || item.prevPos;
      });

      items.forEach(this.runCallback);
      this.refreshPosition('newPos');
      items.forEach(this.applyTranslation);

      // force reflow to put everything in position
      const offSet = document.body.offsetHeight;
      this.items.forEach(this.runTransition.bind(this));
    });
  }

  runCallback(item: TransitionGroupItemDirective) {
    if (item.moveCallback) {
      item.moveCallback();
    }
  }

  runTransition(item: TransitionGroupItemDirective) {
    if (!item.moved) {
      return;
    }
    const cssClass = this.class + '-move';
    const el = item.el;
    const style: any = el.style;
    el.classList.add(cssClass);
    style.transform = style.WebkitTransform = style.transitionDuration = '';
    el.addEventListener(
      'transitionend', () => {
        return item.moveCallback = (e: any) => {
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener('transitionend', item.moveCallback);
            item.moveCallback = null;
            el.classList.remove(cssClass);
          }
        };
      }
    );
  }

  refreshPosition(prop: string) {
    this.items.forEach(item => {
      const { left, top, width, height } = item.el.getBoundingClientRect();
      const position = new DOMRect(left + window.scrollX, top + window.scrollY, width, height);
      item[prop] = position;
    });
  }

  applyTranslation(item: TransitionGroupItemDirective) {
    item.moved = false;
    const dx = item.prevPos.left - item.newPos.left;
    const dy = item.prevPos.top - item.newPos.top;
    if (dx || dy) {
      item.moved = true;
      const style: any = item.el.style;
      style.transform = style.WebkitTransform =
        'translate(' + dx + 'px,' + dy + 'px)';
      style.transitionDuration = '0s';
    }
  }



}
