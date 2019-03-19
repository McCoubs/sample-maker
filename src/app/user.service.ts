import { Injectable } from '@angular/core';
import { UserData } from './interfaces/authentication';
import { environment } from '../environments/environment';
import { User } from './classes/user';
import { isNullOrUndefined } from 'util';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EndpointService } from './endpoint.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private currentUser: User;
  private token: string;

  constructor(private cookieService: CookieService, private http: HttpClient, private endpointService: EndpointService) {}

  public parseJWTToken(token: string): UserData {
      const payload = token.split('.')[1];
      return JSON.parse(window.atob(payload));
  }

  public setCurrentUser(data: UserData): void {
    // Set current user
    this.currentUser = new User(data);
    this.setCookie('currentUser', JSON.stringify(this.currentUser));
  }

  public setJWTToken(token: string): void {
    this.token = token;
    this.setCookie('jwt-token', token);
  }

  public getCurrentUser(): User {
    // retrieve and set current user
    if (isNullOrUndefined(this.currentUser)) {
      const localUser = this.cookieService.check('currentUser') ? JSON.parse(this.cookieService.get('currentUser')) : null;
      if (!isNullOrUndefined(localUser)) {
        this.currentUser = new User(localUser);
      }
    }
    return this.currentUser;
  }

  public getJWTToken(): string {
    if (isNullOrUndefined(this.token)) {
      this.token = this.cookieService.check('jwt-token') ? this.cookieService.get('jwt-token') : null;
    }
    return this.token;
  }

  public clearStorage(): void {
    // empty vars and storage
    this.token = null;
    this.currentUser = null;
    this.cookieService.set('currentUser', null);
    this.setCookie('currentUser', null);
    this.setCookie('jwt-token', null);
  }

  public getUser(id: string | number): Observable<any> {
    return this.http.get(this.endpointService.generateUrl('user', id));
  }

  public getUserSamples(id: string | number): Observable<any> {
    return this.http.get(this.endpointService.generateUrl('user_samples', id));
  }

  public getUserSubscribers(id: string | number): Observable<any> {
    return this.http.get(this.endpointService.generateUrl('user_subscribers', id));
  }

  public getUserSubscriptions(id: string | number): Observable<any> {
    return this.http.get(this.endpointService.generateUrl('user_subscriptions', id));
  }

  private setCookie(cookie: string, value) {
    this.cookieService.set(cookie, value, undefined, undefined, undefined, environment.secureFlag, 'Strict');
  }
}
