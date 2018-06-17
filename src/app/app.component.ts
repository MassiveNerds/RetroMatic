import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'RetroMatic';
  user: Observable<firebase.User>;
  userChanges: Subscription;
  isIn = false;
  theme = 'light';
  constructor(public afAuth: AngularFireAuth, private router: Router) {
    this.user = afAuth.authState;
  }

  loginDisplay = '';
  ngOnInit() {
    this.userChanges= this.user
      .subscribe(user => {
        if (user) {
          const displayName = (user.isAnonymous) ? 'anonymous user' : `${user.email}`;
          this.loginDisplay = `Signed in as ${displayName}`;
        }
      });
  }

  toggleState() {
    const bool = this.isIn;
    this.isIn = bool === false;
  }

  logout() {
    this.userChanges.unsubscribe();
    this.afAuth.auth.signOut();
  }
}
