import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../global-services/authentication.service';
import { UserService } from '../../global-services/user.service';
import { faEnvelope, faSignature } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router } from '@angular/router';
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
  subscribers: Array<User> = [];
  subscriptions: Array<User> = [];
  currentUser = this.userService.getCurrentUser();
  userId = [];

  constructor(
      private authService: AuthenticationService,
      private userService: UserService,
      private sampleService: SampleService,
      private route: ActivatedRoute,
      private router: Router
  ) {}

  sub(): void {
    this.userService.sub(this.userService.getCurrentUser()._id, this.selectedUser._id).subscribe(
        (value) => {
          this.subscribed = true;
          this.getSubscribers();
        }
    );
  }

  unsub(): void {
    this.userService.unsub(this.userService.getCurrentUser()._id, this.selectedUser._id).subscribe(
      (value) => {
        this.subscribed = false;
        this.getSubscribers();
      }
    );
  }

  isSubscribed(): void {
      this.userService.isSubbed(this.currentUser._id, this.selectedUser._id).subscribe(
          (res) => {
              this.subscribed = res && res.follower && res.follower._id === this.currentUser._id;
          }
      );
  }

  getSubscribers(): void {
      this.userService.getUserSubscribers(this.selectedUser._id).subscribe(
          (subscriptions) => {
              this.subscribers = subscriptions.map((sub) => new User(sub.follower));
          }
      );
  }

  getSubscriptions(): void {
      this.userService.getUserSubscriptions(this.selectedUser._id).subscribe(
          (subs) => {
              this.subscriptions = subs.map((sub) => new User(sub.followee));
          }
      );
  }

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
            if (!this.isMyProfile) {
                this.isSubscribed();
            }
            this.sampleService.getSamples(5, 0, [this.selectedUser._id]).subscribe(
                (samples) => {
                  this.userSamples = samples.map((sample) => new Sample(sample));
                  this.userId = [this.selectedUser._id];
                }
            );
            this.getSubscribers();
            this.getSubscriptions();
          },
          // if no user found, re-direct to dashboard
          (error) => {
            this.router.navigateByUrl('dashboard');
          }
      );
    });
  }
}
