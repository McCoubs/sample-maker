import { Component, OnInit } from '@angular/core';
import { SampleService } from '../sample.service';
import { Sample } from '../classes/sample';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {
  
  sampleCache: Array<Array<Sample>>;
  currentSamples = 0;

  constructor(private sampleService: SampleService) {

  }

  ngOnInit() {
    this.sampleService.getSamples(5).subscribe(
      (samples) => {
        this.sampleCache.push(samples.map((sample) => new Sample(sample)));
      },
      (error) => {
        console.log("whio[eps");
      }
    );
  }

}
