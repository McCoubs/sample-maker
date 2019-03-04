import { Injectable } from '@angular/core';
import { UserData } from './interfaces/authentication';
import { User } from './classes/user';
import {isNullOrUndefined} from 'util';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private currentUser: User;
  private token: string;

  constructor() {}

  public parseJWTToken(token: string): UserData {
      const payload = token.split('.')[1];
      return JSON.parse(window.atob(payload));
  }

  public setCurrentUser(data: UserData): void {
    // Set current user
    this.currentUser = new User(data);
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  }

  public setJWTToken(token: string): void {
    this.token = token;
    localStorage.setItem('jwt-token', token);
  }

  public getCurrentUser(): User {
    // retrieve and set current user
    if (isNullOrUndefined(this.currentUser)) {
      const localUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!isNullOrUndefined(localUser)) {
        this.currentUser = new User(localUser);
      }
    }
    return this.currentUser;
  }

  public getJWTToken(): string {
    if (isNullOrUndefined(this.token)) {
      this.token = localStorage.getItem('jwt-token');
    }
    return this.token;
  }

  public clearStorage(): void {
    // empty vars and storage
    this.token = null;
    this.currentUser = null;
    localStorage.setItem('currentUser', null);
    localStorage.setItem('jwt-token', null);
  }
}
