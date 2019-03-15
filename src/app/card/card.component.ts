import { Component, OnInit, Input } from '@angular/core';
import { Sample } from '../classes/sample';
import { SampleService } from '../sample.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  _name;
  _sample;
  playing;
  audioTrack;
  @Input()
  set sample(sample: Sample) {
    this._sample = sample;
    this.playing = false;
  }

  constructor(private sampleService: SampleService) { }

  ngOnInit() {
    this._name = this._sample.name;
  }

  play() {
    if(!this.playing){
      this.sampleService.downloadSample(this._sample.id).subscribe(
        (sample) => {
          this.audioTrack = new Audio();
          this.audioTrack.src = sample;
          this.audioTrack.load();
          this.audioTrack.play();
          this.playing = true;
        },
        (error) => {
          console.error("could not download sample");
        }
      );
    } else {
      this.audioTrack.stop();
      this.playing = false;
    }
  }
}
