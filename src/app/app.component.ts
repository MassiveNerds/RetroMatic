import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        (<any>window).gtag('config', 'UA-41277492-2', { 'page_path': event.urlAfterRedirects });
        (<any>window).gtag('event', 'page_view', { 'send_to': 'UA-41277492-2' });
      }
    });
  }

  ngOnInit() { }
}
