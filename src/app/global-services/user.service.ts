import { Injectable } from '@angular/core';
import { UserData } from '../interfaces/authentication';
import { environment } from '../../environments/environment';
import { User } from '../classes/user';
import { isNullOrUndefined } from 'util';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EndpointService } from './endpoint.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private currentUser: User;

  constructor(private cookieService: CookieService, private http: HttpClient, private endpointService: EndpointService) {}

  private setCookie(cookie: string, value) {
    this.cookieService.set(cookie, value, undefined, undefined, undefined, environment.secureFlag, 'Strict');
  }

  private parseJWTToken(token: string): UserData {
      const payload = token.split('.')[1];
      return JSON.parse(window.atob(payload));
  }

  public setCurrentUser(token: string): void {
    // Set current user
    this.currentUser = new User(this.parseJWTToken(token));
    this.setCookie('currentUser', JSON.stringify(this.currentUser));
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

  public clearStorage(): void {
    // empty vars and storage
    this.currentUser = null;
    this.setCookie('currentUser', null);
  }

  public getUsers(name): Observable<any> {
    let params = new HttpParams();
    params = params.append('name', name);
    return this.http.get(this.endpointService.generateUrl('users'), {params: params});
  }

  public isSubbed(id: string | number, id2: string | number): Observable<any> {
    return this.http.get(this.endpointService.generateUrl('user_subscriber', id, id2));
  }

  public sub(id: string | number, id2: string | number): Observable<any> {
    return this.http.post(this.endpointService.generateUrl('user_subscriber', id, id2), {});
  }

  public unsub(id: string | number, id2: string | number): Observable<any> {
    return this.http.delete(this.endpointService.generateUrl('user_subscriber', id, id2));
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
}
