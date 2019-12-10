import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/database';
import { User } from '../types';
import md5 from 'md5';
import { uniqueNamesGenerator, Config, starWars } from 'unique-names-generator';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<firebase.User>;
  userDetails: firebase.User = null;

  constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase, private router: Router) {
    this.user$ = afAuth.authState;
    this.user$.subscribe(
      (user) => {
        if (user) {
          this.userDetails = user;
        } else {
          this.userDetails = null;
        }
      }
    );
  }

  async register({ email, password, displayName }: {
    email: string;
    password: string;
    displayName: string;
  }) {
    this.sendAuthenticationEvent('register');
    const { user } = await this.afAuth.auth.createUserWithEmailAndPassword(email, password);
    await this.db.object<User>(`/users/${user.uid}`).set({
      displayName,
      md5hash: md5(email),
      favorites: []
    });
  }

  async login({ email, password }: {
    email: string;
    password: string;
  }) {
    this.sendAuthenticationEvent('login');
    const { user } = await this.afAuth.auth.signInWithEmailAndPassword(email, password);
    const snapshot = await firebase.database().ref('/users').child(user.uid).once('value');
    if (!snapshot.exists()) {
      const config: Config = {
        dictionaries: [starWars],
        length: 1
      };
      const characterName: string = uniqueNamesGenerator(config);
      await this.db.object<User>(`/users/${user.uid}`).set({
        displayName: characterName,
        md5hash: md5(email),
        favorites: []
      });
    }
  }

  async loginWithGoogle() {
    this.sendAuthenticationEvent('google');
    const { user, additionalUserInfo } = await this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    if (additionalUserInfo.isNewUser) {
      await this.db.object<User>(`/users/${user.uid}`).set({
        displayName: user.displayName,
        md5hash: md5(user.email),
        favorites: []
      });
    }
  }

  async loginAsGuest() {
    this.sendAuthenticationEvent('guest');
    const { user } = await this.afAuth.auth.signInAnonymously();
    const config: Config = {
      dictionaries: [starWars],
      length: 1
    };
    const characterName: string = uniqueNamesGenerator(config);
    await this.db.object<User>(`/users/${user.uid}`).set({
      displayName: characterName,
      md5hash: '',
      favorites: []
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

  async getAppUser() {
    const snapshot = await firebase.database().ref('/users').child(this.userDetails.uid).once('value');
    return snapshot.val();
  }

  async logout() {
    await this.afAuth.auth.signOut();
    this.router.navigate(['/login']);
  }

  resetPassword(email: string) {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  private sendAuthenticationEvent(eventName: string) {
    (<any>window).gtag('event', eventName, {
      'event_category': 'authentication',
      'event_label': 'origin'
    });
  }
}
