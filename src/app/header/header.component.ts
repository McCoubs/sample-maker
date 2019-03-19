import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../user.service';
import { AuthenticationService } from '../authentication.service';
import { User } from '../classes/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  currentUser: User;
  isLoggedIn: Boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthenticationService,
  ) {
    this.authService.loggedInChange.subscribe((status: boolean) => this.changeStatus(status));
  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  signOut() {
    this.authService.logout();
  }

  private changeStatus(status: boolean): void {
    this.isLoggedIn = status;
    if (this.isLoggedIn) {
      this.currentUser = this.userService.getCurrentUser();
    }
  }
}
