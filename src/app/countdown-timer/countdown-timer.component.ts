import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./countdown-timer.component.css'],
  animations: [
    trigger('visibilityChanged', [
      state('true' , style({ opacity: .15 })),
      state('false', style({ opacity: 0 })),
      transition('* => *', animate('.5s'))
    ]),
    trigger('visibilityFullChanged', [
      state('true' , style({ opacity: 1 })),
      state('false', style({ opacity: 0 })),
      transition('* => *', animate('.5s'))
    ])
  ]
})
export class CountdownTimerComponent implements OnInit {

  private  _timer;
  private  _minutes = 60;
  private  _seconds = 0;
  public countdownTimerString: String;
  public isTimerStarted = false;
  public isTimerEnded = false;

      constructor() { }

      ngOnInit() {
        this.setCountdownTimer();
      }

      setCountdownTimer() {
        const secondsString: string = this._seconds < 10 ? `0${this._seconds}` : `${this._seconds}`;
        const minutesString: string = this._minutes < 10 ? `0${this._minutes}` : `${this._minutes}`;
        this.countdownTimerString = `${minutesString}:${secondsString}`;
      }

      startTimerPressed() {
        this.isTimerStarted = true;
        this.startTimer();
      }

      startTimer() {
        this._timer = Observable.timer(2000, 1000);
        this._timer.subscribe((tick) => {
          this._seconds --;
          if (this._seconds < 0) {
            this._minutes --;
            if (this._minutes < 0){
              this._minutes = 0;
              this._seconds = 0;
              this.isTimerEnded = true;
              this._timer.unsubscribe();
            }else {
              this._seconds = 59;
            }
          }
          this.setCountdownTimer();
        });
  }

}
