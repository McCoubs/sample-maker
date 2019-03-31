import { Component, OnInit } from '@angular/core';
import { SampleService } from '../../global-services/sample.service';
import { Sample } from '../../classes/sample';
import { UserService } from '../../global-services/user.service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  sampleCache: Array<string>;
  searchParams = [];
  searching = false;
  foundUsers = [];

  constructor(private sampleService: SampleService, private userService: UserService) {}

  ngOnInit() {
    this.sampleCache = [];
    this.sampleService.getSamples(5).subscribe(
      (samples) => {
        this.sampleCache = samples.map((sample) => new Sample(sample));
      }
    );
  }

  search(input) {
    if(input) {
      this.searching = true;
      this.setSearch(input);
    }
  }

  reset() {
    this.searching = false;
    this.setSearch("");
    (<HTMLInputElement>document.getElementById("searchBar")).value = "";
  }

  setSearch(option) {
    this.sampleService.getSamples(5, 0, [option]).subscribe(
      (samples) => {
        this.sampleCache = samples.map((sample) => new Sample(sample));
        this.searchParams = [option];
      }
    );

    this.userService.getUsers(option).subscribe(
      (users) => {
        this.foundUsers = users;
      }
    );
  }
}
