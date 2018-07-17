import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-the-header',
  templateUrl: './the-header.component.html',
  styleUrls: ['./the-header.component.scss'],
})
export class TheHeaderComponent implements OnInit {
  user: Observable<firebase.User>;
  userChanges: Subscription;
  loginDisplay = '';

  constructor(public afAuth: AngularFireAuth, private router: Router) {
    this.user = afAuth.authState;
  }
  ngOnInit() {
    this.userChanges = this.user.subscribe((user) => {
      if (user) {
        const displayName = user.isAnonymous
          ? 'anonymous user'
          : `${user.email}`;
        this.loginDisplay = `Signed in as ${displayName}`;
      }
    });
  }

  logout() {
    this.afAuth.auth.signOut()
    this.router.navigate(['/login']);
  }
}
