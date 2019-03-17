import {EventEmitter, Injectable, Output} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TokenPayload } from './interfaces/authentication';
import { UserService } from './user.service';
import { isNullOrUndefined } from 'util';
import { EndpointService } from './endpoint.service';
import {User} from './classes/user';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  @Output() getLoggedInStatus: EventEmitter<boolean> = new EventEmitter();

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
    this.userService.clearStorage();
    this.router.navigateByUrl('/login');
    this.getLoggedInStatus.emit(false);
  }

  public register(user: TokenPayload): Observable<any> {
    // hit register api with given user
    return this.http.post(this.endpointService.generateUrl('register'), user);
  }

  public login(user: TokenPayload): Observable<any> {
    // hit login api with given user info
    this.getLoggedInStatus.emit(true);
    return this.http.post(this.endpointService.generateUrl('login'), user);
  }

  public profile(): Observable<any> {
    const user = this.userService.getCurrentUser();
    return this.http.get(this.endpointService.generateUrl('user', user._id));
  }
}
