import { Component, Input, OnInit } from '@angular/core';
import { Sample } from '../../classes/sample';
import { User } from '../../classes/user';
import { faSignature } from '@fortawesome/free-solid-svg-icons';
import { SampleService } from '../../global-services/sample.service';
import { UserService } from '../../global-services/user.service';

@Component({
  selector: 'app-subscription-card',
  templateUrl: './subscription-card.component.html',
  styleUrls: ['./subscription-card.component.scss']
})
export class SubscriptionCardComponent implements OnInit {

  faSignature = faSignature;
  userSamples: Array<Sample> = [];
  thisUser: User;
  userId = [];

  @Input()
  set user(user: User) {
    this.thisUser = user;
  }
  constructor(private userService: UserService, private sampleService: SampleService) {}

  ngOnInit() {
    this.sampleService.getSamples(5, 0, [this.thisUser._id]).subscribe(
        (samples) => {
          this.userSamples = samples.map((sample) => new Sample(sample));
          this.userId = [this.thisUser._id];
        }
    );
  }
}
