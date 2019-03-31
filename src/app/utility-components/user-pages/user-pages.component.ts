import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../classes/user';

@Component({
  selector: 'app-user-pages',
  templateUrl: './user-pages.component.html',
  styleUrls: ['./user-pages.component.scss']
})
export class UserPagesComponent implements OnInit {
  userSet: Array<User>;
  pageOfUsers: Array<User>;
  @Input()
  set users(givenSet: Array<User>) {
    this.userSet = givenSet;
  }
  constructor() {}

  ngOnInit() {}

  onChangePage(nextPage: Array<User>) {
    this.pageOfUsers = nextPage;
  }
}
