import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenPayload, TokenResponse, UserDetails } from './interfaces/authentication';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private token: string;

  constructor(private http: HttpClient, private router: Router) {}

  public getUserDetails(): UserDetails {
    const token = this.getToken();
    if (token) {
      const payload = token.split('.')[1];
      return JSON.parse(window.atob(payload));
    } else {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    const user = this.getUserDetails();
    if (user) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  private saveToken(token: string): void {
    localStorage.setItem('jwt-token', token);
    this.token = token;
  }

  private getToken(): string {
    if (!this.token) {
      this.token = localStorage.getItem('jwt-token');
    }
    return this.token;
  }

  public logout(): void {
    this.token = '';
    window.localStorage.removeItem('jwt-token');
    this.router.navigateByUrl('/');
  }

  public register(user: TokenPayload): Observable<any> {
    return this.http.post('/api/register', user).pipe(
        map((data: TokenResponse) => {
          if (data.token) {
            this.saveToken(data.token);
          }
          return data;
        })
    );
  }

  public login(user: TokenPayload): Observable<any> {
    return this.http.post('/api/login', user).pipe(
        map((data: TokenResponse) => {
          if (data.token) {
            this.saveToken(data.token);
          }
          return data;
        })
    );
  }

  public profile(): Observable<any> {
    const user = this.getUserDetails();
    return this.http.get('api/users/' + user._id, { headers: { Authorization: `Bearer ${this.getToken()}` }}).pipe(
        map((data: TokenResponse) => {
          if (data.token) {
            this.saveToken(data.token);
          }
          return data;
        })
    );
  }
}
