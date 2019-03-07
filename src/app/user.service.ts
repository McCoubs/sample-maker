import { Injectable } from '@angular/core';
import { UserData } from './interfaces/authentication';
import { User } from './classes/user';
import { isNullOrUndefined } from 'util';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private currentUser: User;
  private token: string;

  constructor(private cookieService: CookieService) {}

  public parseJWTToken(token: string): UserData {
      const payload = token.split('.')[1];
      return JSON.parse(window.atob(payload));
  }

  public setCurrentUser(data: UserData): void {
    // Set current user
    this.currentUser = new User(data);
    this.cookieService.set('currentUser', JSON.stringify(this.currentUser));
  }

  public setJWTToken(token: string): void {
    this.token = token;
    this.cookieService.set('jwt-token', token);
  }

  public getCurrentUser(): User {
    // retrieve and set current user
    if (isNullOrUndefined(this.currentUser)) {
      const localUser = JSON.parse(this.cookieService.get('currentUser'));
      if (!isNullOrUndefined(localUser)) {
        this.currentUser = new User(localUser);
      }
    }
    return this.currentUser;
  }

  public getJWTToken(): string {
    if (isNullOrUndefined(this.token)) {
      this.token = this.cookieService.get('jwt-token');
    }
    return this.token;
  }

  public clearStorage(): void {
    // empty vars and storage
    this.token = null;
    this.currentUser = null;
    this.cookieService.set('currentUser', null);
    this.cookieService.set('jwt-token', null);
  }
}
