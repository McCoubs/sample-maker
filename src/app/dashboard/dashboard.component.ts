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
  showNext = false;

  constructor(private sampleService: SampleService) {

  }

  ngOnInit() {
    this.sampleCache = [];
    this.sampleService.getSamples(5).subscribe(
      (samples) => {
        this.sampleCache.push(samples.map((sample) => new Sample(sample)));
      },
      (error) => {
        console.log("whio[eps");
      }
    );

    this.sampleService.getSamples(5, (this.currentSamples + 1) * 5).subscribe(
      (samples) => {
        if(samples.length > 0){
          this.sampleCache.push(samples.map((sample) => new Sample(sample)));
          this.showNext = true;
        }
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

  loadNext() {
    this.currentSamples++;
    this.sampleService.getSamples(5, (this.currentSamples + 1) * 5).subscribe(
      (samples) => {
        if(samples.length > 0){
          this.sampleCache.push(samples.map((sample) => new Sample(sample)));
        } else {this.showNext = false;}
      },
      (error) => {
        console.log("whio[eps");
      }
    );
  }

  loadLast() {
    this.currentSamples--;
    this.showNext = true;
  }

  search(input) {
    this.sampleService.getSamples(5, 0, ['anime']).subscribe(
      (samples) => {
        console.log(samples);
        if(samples.length > 0){
          this.sampleCache.push(samples.map((sample) => new Sample(sample)));
        } else {this.showNext = false;}
      },
      (error) => {
        console.log("whio[eps");
      }
    );
  }

  reset() {
    console.log("reset");
  }
}
