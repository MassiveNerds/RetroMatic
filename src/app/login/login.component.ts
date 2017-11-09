import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: Observable<firebase.User>;
  error: Error;
  returnUrl: string;
  constructor(public afAuth: AngularFireAuth, private router: Router, private route: ActivatedRoute) {
    this.user = afAuth.authState;
  }
  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  register(email: string, password: string) {
    this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then(user => this.login(email, password))
      .catch(err => this.error = err);
  }

  login(email: string, password: string) {
    this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then(() => this.router.navigateByUrl(this.returnUrl))
      .catch(err => this.error = err);
  }

  loginAsGuest() {
    this.afAuth.auth.signInAnonymously()
      .then(() => this.router.navigateByUrl(this.returnUrl))
      .catch(err => this.error = err);
  }
}
