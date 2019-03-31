import { Component, OnInit } from '@angular/core';
import {User} from '../../classes/user';
import {UserService} from '../../global-services/user.service';

@Component({
  selector: 'app-subscription-page',
  templateUrl: './subscription-page.component.html',
  styleUrls: ['./subscription-page.component.scss']
})
export class SubscriptionPageComponent implements OnInit {

  subscriptions: Array<User> = [];
  pageOfSubscriptions: Array<User> = [];
  currentUser: User;
  constructor(
      private userService: UserService
  ) { }

  getSubscriptions(): void {
    this.userService.getUserSubscriptions(this.currentUser._id).subscribe(
        (subs) => {
          this.subscriptions = subs.map((sub) => new User(sub.followee));
        }
    );
  }

  onChangePage(nextPage: Array<User>) {
    this.pageOfSubscriptions = nextPage;
  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    this.getSubscriptions();
  }

}
