import { Component, Input } from '@angular/core';
import { Sample } from '../../classes/sample';
import { SampleService } from '../../global-services/sample.service';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent {
  sampleCache: Array<Array<Sample>>;
  currentSamples = 0;
  showNext = false;
  _displayCache;
  noSample = false;
  searchParams = [];
  @Input()
  set inputCache(inputCache: Array<Sample>) {
    this._displayCache = inputCache;
    this.sampleCache = [];
    this.sampleCache.push(this._displayCache);
  };
  @Input()
  set search(params) {
    this.searchParams = params;
  }

  constructor(private sampleService: SampleService) {

  }

  ngOnChanges() {
    this.showNext = false;
    if(this._displayCache && this._displayCache.length > 0) {
      this.noSample = false;
      this.sampleCache = [];
      this.sampleCache[0] = this._displayCache;
      this.currentSamples = 0;
      this.loadSamples((samples) => {
        if(samples.length > 0){
          this.sampleCache.push(samples.map((sample) => new Sample(sample)));
          this.showNext = true;
        }
      });
    } else this.noSample = true;
  }

  loadNext() {
    this.currentSamples++;
    this._displayCache = this.sampleCache[this.currentSamples];
    
    if(!this.sampleCache.length[this.currentSamples + 1]){
      this.loadSamples((samples) => {
        if(samples.length > 0){
          this.sampleCache.push(samples.map((sample) => new Sample(sample)));
        } else {this.showNext = false;}
      });
    }
  }

  loadLast() {
    this.currentSamples--;
    this._displayCache = this.sampleCache[this.currentSamples];
    this.showNext = true;
  }

  loadSamples(callback) {
    this.sampleService.getSamples(5, (this.currentSamples + 1) * 5, this.searchParams).subscribe(
      (samples) => {
        callback(samples);
      },
      (error) => {
        console.log("Could not get samples");
      }
    );
  }

}
