import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

const AUTH_ROUTES = ['/login', '/register', '/resetpassword'];

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  showHeader = true;

  constructor(private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
      this.showHeader = !AUTH_ROUTES.some(r => e.urlAfterRedirects.startsWith(r));
      (<any>window).gtag('config', 'UA-41277492-2', { page_path: e.urlAfterRedirects });
      (<any>window).gtag('event', 'page_view', { send_to: 'UA-41277492-2' });
    });
  }

  ngOnInit() {}
}
