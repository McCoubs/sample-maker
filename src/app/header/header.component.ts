import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import {User} from '../classes/user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  returnUrl;
  currentUser = this.userService.getCurrentUser();
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {
  }

  ngOnInit() {
  }

  navigate(url) {
    this.returnUrl = this.route.snapshot.queryParams[url] || '/dashboard';
    this.router.navigateByUrl(url);
  }
}
