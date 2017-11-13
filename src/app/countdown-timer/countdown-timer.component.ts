import {Component, Input, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';


@Component({
  selector: 'app-countdown-timer',
  templateUrl: './countdown-timer.component.html',
  styleUrls: ['./countdown-timer.component.less'],
  animations: [
    trigger('visibilityChanged', [
      state('true', style({opacity: .15})),
      state('false', style({opacity: 0})),
      transition('* => *', animate('.5s'))
    ]),
    trigger('visibilityFullChanged', [
      state('true', style({opacity: 1})),
      state('false', style({opacity: 0})),
      transition('* => *', animate('.5s'))
    ]),
    trigger('hideRunningOutaTime', [
      state('true', style({opacity: 1})),
      state('false', style({opacity: 0})),
      transition('* => *', animate('10s'))
    ]),
    trigger('hideOutaTime', [
      state('true', style({opacity: 1})),
      state('false', style({opacity: 0})),
      transition('* => *', animate('5s'))
    ])
  ]
})
export class CountdownTimerComponent implements OnInit, OnChanges {

  @Input() shouldStartTimer: boolean;
  private _timer;
  private _minutes = 16;
  private _seconds = 0;
  private _totalSeconds = (this._minutes * 60) + this._seconds;
  private _runningOutOfTime = 15 * 60;
  private _outOfTime = 60;
  public countdownTimerString: String;
  public isTimerStarted = false;
  public isTimerRunning = false;
  public isTimerEnded = false;
  public shouldHideRunningOutaTime = false;
  public shouldHideOutaTime = false;

  constructor() {
  }

  ngOnInit() {
    this.setCountdownTimer();
    this.startTimer();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['shouldStartTime'] && changes['shouldStartTimer'].currentValue === true) {
      this.startTimer();
    }
  }

  setCountdownTimer() {
    const secondsString: string = this._seconds < 10 ? `0${this._seconds}` : `${this._seconds}`;
    const minutesString: string = this._minutes < 10 ? `0${this._minutes}` : `${this._minutes}`;
    this.countdownTimerString = `${minutesString}:${secondsString}`;
  }

  startTimerPressed() {
    this.isTimerStarted = true;
    this.isTimerRunning = true;
    this.startTimer();
  }

  startTimer() {
    this._timer = Observable.timer(2000, 1000);
    this._timer.subscribe((tick) => {
      this._seconds--;
      this._totalSeconds--;
      if (this._seconds < 0) {
        this._minutes--;
        if (this._minutes < 0) {
          this._minutes = 0;
          this._seconds = 0;
          this.isTimerEnded = true;
          this.isTimerRunning = false;
          this._timer.unsubscribe();
        } else {
          this._seconds = 59;
        }
      }
      this.setCountdownTimer();
      this.checkBackgroundColor();
    });
  }

  checkBackgroundColor() {
    if (this._totalSeconds < this._runningOutOfTime && this._totalSeconds > this._outOfTime) {
      this.shouldHideRunningOutaTime = true;
    } else if (this._totalSeconds < this._outOfTime) {
      this.shouldHideOutaTime = true;
    }
  }

}
