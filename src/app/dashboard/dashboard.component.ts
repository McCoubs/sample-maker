import { Component, OnInit } from '@angular/core';
import { SampleService } from '../sample.service';
import { Sample } from '../classes/sample';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  sampleCache: Array<Array<string>>;
  currentSamples = 0;

  constructor(private sampleService: SampleService) {

  }

  ngOnInit() {
    this.sampleCache = [];
    // this.sampleCache.push(['butt', 'poop']);
    this.sampleService.getSamples(5).subscribe(
      (samples) => {
        this.sampleCache.push(samples.map((sample) => new Sample(sample)));
      },
      (error) => {
        console.log("whio[eps");
      }
    );
  }

  press(file) {
    this.sampleService.createSample(file, {}).subscribe(
      (data) => console.log(data),
      (error) => console.log(error)
    );
  }

}
