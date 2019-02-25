import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

type AuthOptions = {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private user: Observable<firebase.User>;
  private userDetails: firebase.User = null;

  constructor(private afAuth: AngularFireAuth, private router: Router) {
    this.user = afAuth.authState;
    this.user.subscribe(
      (user) => {
        if (user) {
          this.userDetails = user;
        }
        else {
          this.userDetails = null;
        }
      }
    );
  }

  doRegister(options: AuthOptions) {
    return new Promise<any>((resolve, reject) => {
      this.sendAuthenticationEvent('register');
      this.afAuth.auth.createUserWithEmailAndPassword(options.email, options.password)
        .then(result => {
          resolve(result);
        }, error => reject(error));
    });
  }

  doLogin(options: AuthOptions) {
    return new Promise<any>((resolve, reject) => {
      this.sendAuthenticationEvent('login');
      this.afAuth.auth.signInWithEmailAndPassword(options.email, options.password)
        .then(result => {
          resolve(result);
        }, error => reject(error));
    });
  }

  doLoginWithGoogle() {
    return new Promise<any>((resolve, reject) => {
      this.sendAuthenticationEvent('google');
      this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .then(result => {
          resolve(result);
        }, error => reject(error));
    });
  }

  doLoginAsGuest() {
    return new Promise<any>((resolve, reject) => {
      this.sendAuthenticationEvent('guest');
      this.afAuth.auth.signInAnonymously()
        .then(result => {
          resolve(result);
        }, error => reject(error));
    });
  }

  isLoggedIn() {
    if (this.userDetails == null) {
      return false;
    } else {
      return true;
    }
  }

  getUserDetails() {
    return this.userDetails;
  }

  logout() {
    this.afAuth.auth.signOut()
      .then(() => this.router.navigate(['/login']));
  }

  private sendAuthenticationEvent(eventName: string) {
    (<any>window).gtag('event', eventName, {
      'event_category': 'authentication',
      'event_label': 'origin'
    });
  }
}
