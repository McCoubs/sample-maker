import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { UserService } from '../user.service';
import { faEnvelope, faSignature } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { User } from '../classes/user';
import { Sample } from '../classes/sample';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  faSignature = faSignature;
  faEnvelope = faEnvelope;
  // temp profile picture
  profilePic = 'https://i.stack.imgur.com/l60Hf.png';

  // selectedUser will be passed in when clicking user link, currentUser for now
  selectedUser: User;
  subscribed: Boolean = false;
  isMyProfile: Boolean = false;
  selectedTab = 0;
  userSamples: Array<Sample> = [];
  // TODO: these are currently just arrays of IDs
  subscribers: Array<String> = [];
  subscriptions: Array<String> = [];
  currentUser = this.userService.getCurrentUser();

  constructor(
      private authService: AuthenticationService,
      private userService: UserService,
      private route: ActivatedRoute
  ) { }

  onSelect(s: string): void {
    if (s === 'Samples') {
      this.selectedTab = 0;
    } else if (s === 'Subscriptions') {
      this.selectedTab = 1;
    } else {
      this.selectedTab = 2;
    }
  }

  sub(): void {
    this.subscribers = this.getSubscribers();
  }

  unsub(): void {
    this.subscribers = this.getSubscribers();
  }

  edit(): void {
    this.selectedUser = this.selectedUser;
  }

  hasNoSamples(): Boolean {
    if (this.userSamples.length === 0) {
      return true;
    }
    return false;
  }

  getSubscribers(): Array<String> {
    this.userService.getUserSubscribers(this.selectedUser._id).subscribe(
        (subscribers) => {
          return (subscribers.map((subscriber) => String(subscriber)));
        },
        (error) => {
          console.log(error);
        }
    );
    return [];
  }

  getSubscriptions(): Array<String> {
    this.userService.getUserSubscriptions(this.selectedUser._id).subscribe(
        (subscriptions) => {
          return (subscriptions.map((subscription) => String(subscription)));
        },
        (error) => {
          console.log(error);
        }
    );
    return [];
  }

  ngOnInit() {
    this.userService.getUser(this.route.snapshot.paramMap.get('id')).subscribe(
        (user) => {
          this.selectedUser = new User(user);
          this.isMyProfile = this.selectedUser._id === this.currentUser._id;
          this.userService.getUserSamples(this.selectedUser._id).subscribe(
              (samples) => {
                this.userSamples = (samples.map((sample) => new Sample(sample)));
              }, (error) => {
                console.log(error);
              }
          );
          this.subscribers = this.getSubscribers();
          this.subscriptions = this.getSubscriptions();
        },
        (error) => {
          console.log(error);
        }
    );
  }

}