import { Component, OnInit } from '@angular/core';
import { SampleService } from '../sample.service';
import { Sample } from '../classes/sample';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  sampleCache: Array<string>;
  searchParams = [];

  constructor(private sampleService: SampleService) {

  }

  ngOnInit() {
    this.sampleCache = [];
    this.sampleService.getSamples(5).subscribe(
      (samples) => {
        this.sampleCache = samples.map((sample) => new Sample(sample));
      },
      (error) => {
        console.log("whio[eps");
      }
    );
  }

  press(file) {
    this.sampleService.createSample(file, {'tags':'anime'}).subscribe(
      (data) => console.log(data),
      (error) => console.log(error)
    );
  }

  search(input) {
    this.searchParams = this.searchParams.concat([input]);
  }

  reset() {
    console.log("reset");
  }
}
