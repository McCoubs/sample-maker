import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenPayload, TokenResponse } from './interfaces/authentication';
import { UserService } from './user.service';
import { isNullOrUndefined } from 'util';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient, private router: Router, private userService: UserService) {}

  public isLoggedIn(): boolean {
    // get current user and check expiry token
    const user = this.userService.getCurrentUser();
    if (!isNullOrUndefined(user)) {
      return user.exp > Date.now() / 1000;
    } else {
      return false;
    }
  }

  public logout(): void {
    // clear storage and navigate to home
    this.userService.clearStorage();
    this.router.navigateByUrl('/login');
  }

  public register(user: TokenPayload): Observable<any> {
    // hit register api with given user
    return this.http.post('/api/register', user);
  }

  public login(user: TokenPayload): Observable<any> {
    // hit login api with given user info
    return this.http.post('/api/login', user);
  }

  public profile(): Observable<any> {
    const user = this.userService.getCurrentUser();
    return this.http.get('api/users/' + user._id, { headers: { Authorization: `Bearer ${this.userService.getJWTToken()}` }}).pipe(
        map((data: TokenResponse) => {
          if (data.token) {
            this.userService.setCurrentUser(this.userService.parseJWTToken(data.token));
            this.userService.setJWTToken(data.token);
          }
          return data;
        })
    );
  }
}
