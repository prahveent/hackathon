import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.authState$.pipe(
      map(authState => {
        if (authState.isAuthenticated) {
          return true;
        } else {
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.authState$.pipe(
      map(authState => {
        if (authState.isAuthenticated && authState.user?.roles.includes('admin')) {
          return true;
        } else if (authState.isAuthenticated) {
          return this.router.createUrlTree(['/dashboard']);
        } else {
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class CustomerGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.authState$.pipe(
      map(authState => {
        if (authState.isAuthenticated && authState.user?.roles.includes('customer')) {
          return true;
        } else if (authState.isAuthenticated) {
          return this.router.createUrlTree(['/admin']);
        } else {
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
} 