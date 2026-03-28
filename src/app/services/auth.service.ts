import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
} from '@angular/fire/auth';
import { Database, ref, set, get } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../types';
import md5 from 'md5';
import { uniqueNamesGenerator, Config, starWars } from 'unique-names-generator';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<any>;
  userDetails: any = null;

  constructor(private auth: Auth, private db: Database, private router: Router) {
    this.user$ = authState(this.auth);
    this.user$.subscribe(user => {
      this.userDetails = user || null;
    });
  }

  async register({ email, password, displayName }: { email: string; password: string; displayName: string }) {
    this.sendAuthenticationEvent('register');
    const { user } = await createUserWithEmailAndPassword(this.auth, email, password);
    await set(ref(this.db, `/users/${user.uid}`), {
      displayName,
      md5hash: md5(email),
      favorites: [],
    });
  }

  async login({ email, password }: { email: string; password: string }) {
    this.sendAuthenticationEvent('login');
    const { user } = await signInWithEmailAndPassword(this.auth, email, password);
    const snapshot = await get(ref(this.db, `/users/${user.uid}`));
    if (!snapshot.exists()) {
      const config: Config = {
        dictionaries: [starWars],
        length: 1,
      };
      const characterName: string = uniqueNamesGenerator(config);
      await set(ref(this.db, `/users/${user.uid}`), {
        displayName: characterName,
        md5hash: md5(email),
        favorites: [],
      });
    }
  }

  async loginWithGoogle() {
    this.sendAuthenticationEvent('google');
    const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
    const user = result.user;
    const additionalUserInfo = (result as any).additionalUserInfo;
    if (additionalUserInfo?.isNewUser) {
      await set(ref(this.db, `/users/${user.uid}`), {
        displayName: user.displayName,
        md5hash: md5(user.email),
        favorites: [],
      });
    } else {
      const snapshot = await get(ref(this.db, `/users/${user.uid}`));
      if (!snapshot.exists()) {
        await set(ref(this.db, `/users/${user.uid}`), {
          displayName: user.displayName,
          md5hash: md5(user.email),
          favorites: [],
        });
      }
    }
  }

  async loginAsGuest() {
    this.sendAuthenticationEvent('guest');
    const { user } = await signInAnonymously(this.auth);
    const config: Config = {
      dictionaries: [starWars],
      length: 1,
    };
    const characterName: string = uniqueNamesGenerator(config);
    await set(ref(this.db, `/users/${user.uid}`), {
      displayName: characterName,
      md5hash: '',
      favorites: [],
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
    const snapshot = await get(ref(this.db, `/users/${this.userDetails.uid}`));
    return snapshot.val();
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  private sendAuthenticationEvent(eventName: string) {
    (<any>window).gtag('event', eventName, {
      event_category: 'authentication',
      event_label: 'origin',
    });
  }
}
