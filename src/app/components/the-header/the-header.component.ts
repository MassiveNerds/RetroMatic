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
export class TheHeaderComponent {
  user: Observable<firebase.User>;
  userChanges: Subscription;

  constructor(public afAuth: AngularFireAuth, private router: Router) {
    this.user = afAuth.authState;
  }

  logout() {
    this.afAuth.auth.signOut()
    this.router.navigate(['/login']);
  }
}
