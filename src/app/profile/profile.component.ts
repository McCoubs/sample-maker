import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { UserService } from '../user.service';
import { faEnvelope, faSignature } from '@fortawesome/free-solid-svg-icons';
//import { MOCKUSER } from 'src/app/mock-user';


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

  subscribed = false;
  // selectedUser will be passed in when clicking user link, currentUser for now
  selectedUser = this.userService.getCurrentUser();
  selectedTab = 0;
  currentUser = this.userService.getCurrentUser();

  constructor(
      private authService: AuthenticationService,
      private userService: UserService,
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

  subscribe(): void {
    this.subscribed = true;
  }

  unsub(): void {
    this.subscribed = false;
  }

  edit(): void {
    this.selectedUser = this.selectedUser;
  }

  ngOnInit() {
  }


}
