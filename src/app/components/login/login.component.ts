import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  user: Observable<firebase.User>;
  error: Error;
  returnUrl: string;

  constructor(
    public afAuth: AngularFireAuth,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.user = afAuth.authState;
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  register(email: string, password: string) {
    (<any>window).gtag('event', 'register', {
      'event_category': 'authentication',
      'event_label': 'origin'
    });
    this.afAuth.auth
      .createUserWithEmailAndPassword(email, password)
      .then((user) => this.login(email, password))
      .catch((err) => (this.error = err));
  }

  login(email: string, password: string) {
    (<any>window).gtag('event', 'login', {
      'event_category': 'authentication',
      'event_label': 'origin'
    });
    this.afAuth.auth
      .signInWithEmailAndPassword(email, password)
      .then(() => this.router.navigateByUrl(this.returnUrl))
      .catch((err) => (this.error = err));
  }

  loginWithGoogle() {
    (<any>window).gtag('event', 'google', {
      'event_category': 'authentication',
      'event_label': 'origin'
    });
    this.afAuth.auth
      .signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(() => this.router.navigateByUrl(this.returnUrl))
      .catch((err) => (this.error = err));
  }

  loginAsGuest() {
    (<any>window).gtag('event', 'guest', {
      'event_category': 'authentication',
      'event_label': 'origin'
    });
    this.afAuth.auth
      .signInAnonymously()
      .then(() => this.router.navigateByUrl(this.returnUrl))
      .catch((err) => (this.error = err));
  }
}
