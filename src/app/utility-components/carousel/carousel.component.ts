import { Component, OnInit, Input } from '@angular/core';
import { Sample } from '../../classes/sample';
import { SampleService } from '../../global-services/sample.service';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {
  sampleCache: Array<Array<Sample>>;
  currentSamples = 0;
  showNext = false;
  _displayCache;
  @Input()
  set inputCache(inputCache: Array<Sample>) {
    this._displayCache = inputCache;
    this.sampleCache = [];
    this.sampleCache.push(this._displayCache);
  };

  constructor(private sampleService: SampleService) {

  }

  ngOnInit() {

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

  loadNext() {
    this.currentSamples++;
    this._displayCache = this.sampleCache[this.currentSamples];
    
    // if the next isn't already loaded
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
    this._displayCache = this.sampleCache[this.currentSamples];
    this.showNext = true;
  }

}
