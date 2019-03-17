import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { AuthenticationService } from '../authentication.service';
import {User} from '../classes/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  returnUrl;
  currentUser: User = this.userService.getCurrentUser();
  isLoggedIn: Boolean = false;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthenticationService,
    private router: Router
  ) {
    authService.getLoggedInStatus.subscribe(status => this.changeStatus(status));
    userService.emitCurrentUser.subscribe(curUser => this.setCurrentUser(curUser));
  }

  changeStatus(status: boolean): void {
    this.isLoggedIn = status;
  }

  setCurrentUser(curUser: User): void {
    this.currentUser = curUser;
  }
  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  navigate(url) {
    this.returnUrl = this.route.snapshot.queryParams[url] || '/dashboard';
    this.router.navigateByUrl(url);
  }

  signOut() {
    this.userService.clearStorage();
    this.currentUser = null;
    this.isLoggedIn = false;
    this.authService.logout();
    this.ngOnInit();
  }
}
