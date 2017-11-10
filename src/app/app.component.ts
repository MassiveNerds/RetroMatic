import { LoginComponent } from './login/login.component';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { CollapseModule } from 'ngx-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  title = 'Agile Retrospective';
  user: Observable<firebase.User>;
  isIn = false;
  theme = 'light';
  constructor(public afAuth: AngularFireAuth) {
    this.user = afAuth.authState;
  }

  loginDisplay = '';
  ngOnInit() {
    this.user
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
    this.afAuth.auth.signOut();
  }
}
