import { Component, Input, OnInit } from '@angular/core';
import { faSignature } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../global-services/user.service';
import { User } from '../../classes/user';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})
export class UserCardComponent implements OnInit {

  profilePic = 'https://i.stack.imgur.com/l60Hf.png';
  faSignature = faSignature;
  isMe: Boolean = false;
  subscribed: Boolean = false;
  currentUser = this.userService.getCurrentUser();
  thisUser: User;

  @Input()
  set user(user: User) {
    this.thisUser = user;
  }

  constructor(private userService: UserService, private route: ActivatedRoute) {}

  sub(): void {
    this.userService.sub(this.userService.getCurrentUser()._id, this.thisUser._id).subscribe(
        (value) => {
          this.subscribed = true;
        }
    );
  }

  unsub(): void {
    this.userService.unsub(this.userService.getCurrentUser()._id, this.thisUser._id).subscribe(
        (value) => {
          this.subscribed = false;
        }
    );
  }

  isSubscribed(): void {
    this.userService.isSubbed(this.currentUser._id, this.thisUser._id).subscribe(
        (res) => {
          this.subscribed = res && res.follower && res.follower._id === this.currentUser._id;
        }
    );
  }

  ngOnInit() {
    // on route change
    this.route.paramMap.subscribe((params) => {
        this.isSubscribed();
        this.isMe = this.thisUser._id === this.currentUser._id;
    });
  }
}
