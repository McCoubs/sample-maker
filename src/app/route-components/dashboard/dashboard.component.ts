import { Component, OnInit } from '@angular/core';
import { SampleService } from '../../global-services/sample.service';
import { Sample } from '../../classes/sample';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  sampleCache: Array<string>;
  searchParams = [];
  searching = false;

  constructor(private sampleService: SampleService) {}

  ngOnInit() {
    this.sampleCache = [];
    this.sampleService.getSamples(5).subscribe(
      (samples) => {
        this.sampleCache = samples.map((sample) => new Sample(sample));
      },
      (error) => {
        console.log(error);
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

  setSearch(option){
    this.sampleService.getSamples(5, 0, [option]).subscribe(
      (samples) => {
        this.sampleCache = samples.map((sample) => new Sample(sample));
        this.searchParams = [option];
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
