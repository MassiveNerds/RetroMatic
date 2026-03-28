import { tap, map, take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth, authState } from '@angular/fire/auth';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return authState(this.auth).pipe(
      take(1),
      map(authState => !!authState),
      tap(auth =>
        !auth
          ? this.router.navigate(['/login'], {
              queryParams: { returnUrl: state.url },
            })
          : true
      )
    );
  }
}
