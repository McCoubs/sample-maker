import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import {TokenPayload, TokenResponse} from '../interfaces/authentication';
import { UserService } from './user.service';
import { isNullOrUndefined } from 'util';
import { EndpointService } from './endpoint.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  @Output() loggedInChange: EventEmitter<boolean> = new EventEmitter();

  constructor(private http: HttpClient,
              private router: Router,
              private userService: UserService,
              private endpointService: EndpointService
  ) {}

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
    this.http.post(this.endpointService.generateUrl('logout'), {}).subscribe(
        (data) => {
          this.userService.clearStorage();
          this.router.navigateByUrl('/login');
          this.loggedInChange.emit(false);
        }
    );
  }

  public register(user: TokenPayload): Observable<any> {
    // hit register api with given user
    return this.http.post(this.endpointService.generateUrl('register'), user).pipe(
        map((data: TokenResponse) => this.pipeHelper(data))
    );
  }

  public login(user: TokenPayload): Observable<any> {
    // hit login api with given user info
    return this.http.post(this.endpointService.generateUrl('login'), user).pipe(
        map((data: TokenResponse) => this.pipeHelper(data))
    );
  }

  private pipeHelper(data: TokenResponse): TokenResponse {
    this.userService.setCurrentUser(data.token);
    this.loggedInChange.emit(true);
    return data;
  }
}
