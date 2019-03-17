import { Component, OnInit, Input } from '@angular/core';
import { Sample } from '../classes/sample';
import { SampleService } from '../sample.service';
import { AudioWrapper } from '../classes/AudioWrapper';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  _name;
  _author;
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
    this.sampleService.downloadSample(this._sample._id).subscribe(
      (arrayBuffer) => {
        const test = new AudioWrapper();
        test.decodeArrayBuffer(arrayBuffer, () => {test.startAudio()});
      },
      (error) => console.log(error)
    );
  }

  download() {
    // uhoh
  }
}
