import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../global-services/authentication.service';
import { UserService } from '../../global-services/user.service';
import { faEnvelope, faSignature } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../classes/user';
import { Sample } from '../../classes/sample';
import { SampleService } from '../../global-services/sample.service';

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
  userId = [];

  constructor(
      private authService: AuthenticationService,
      private userService: UserService,
      private sampleService: SampleService,
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
    //this.subscribers = this.getSubscribers();
  }

  unsub(): void {
    //this.subscribers = this.getSubscribers();
  }

  edit(): void {
    this.selectedUser = this.selectedUser;
  }

  hasNoSamples(): Boolean {
    return this.userSamples.length === 0;
  }

  // getSubscribers(): Array<String> {
  //   this.userService.getUserSubscribers(this.selectedUser._id).subscribe(
  //       (subscribers) => {
  //         return (subscribers.map((subscriber) => String(subscriber)));
  //       },
  //       (error) => {
  //         console.log(error);
  //       }
  //   );
  //   return [];
  // }

  // getSubscriptions(): Array<String> {
  //   this.userService.getUserSubscriptions(this.selectedUser._id).subscribe(
  //       (subscriptions) => {
  //         return (subscriptions.map((subscription) => String(subscription)));
  //       },
  //       (error) => {
  //         console.log(error);
  //       }
  //   );
  //   return [];
  // }

  ngOnInit() {
    // on route change
    this.route.paramMap.subscribe((params) => {
      // reset vars
      this.selectedTab = 0;
      this.userSamples = [];
      this.isMyProfile = false;
      this.selectedUser = null;
      // get user with id from the route
      this.userService.getUser(params.get('id')).subscribe(
          (user) => {
            // set profile user and samples
            this.selectedUser = new User(user);
            this.isMyProfile = this.selectedUser._id === this.currentUser._id;
            this.sampleService.getSamples(5, 0, [this.selectedUser._id]).subscribe(
                (samples) => {
                  this.userSamples = samples.map((sample) => new Sample(sample));
                  this.userId = [this.selectedUser._id];
                }
            );
            // this.subscribers = this.getSubscribers();
            // this.subscriptions = this.getSubscriptions();
          },
          (error) => {
            console.log(error);
          }
      );
    });
  }
}
