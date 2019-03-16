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
    // if(!this.playing){
    //   this.sampleService.downloadSample(this._sample.file_id).subscribe(
    //     (sample) => {
    //       this.audioTrack = new Audio();
    //       this.audioTrack.src = sample;
    //       this.audioTrack.load();
    //       this.audioTrack.play();
    //       this.playing = true;
    //     },
    //     (error) => {
    //       console.error("could not download sample");
    //     }
    //   );
    // } else {
    //   this.audioTrack.stop();
    //   this.playing = false;
    // }
  }

  download() {
    this.sampleService.downloadSample(this._sample._id).subscribe(
      (arrayBuffer) => {
        debugger;
        const test = new AudioWrapper();
        test.decodeArrayBuffer(arrayBuffer, () => {test.startAudio()});
      },
      (error) => console.log(error)
    );
    // console.log(this._sample);
    // this.sampleService.downloadSample(this._sample._id).subscribe(
    //   (sample) => {
    //     this.audioTrack = sample;
    //   },
    //   (error) => {
    //     console.error("could not get file");
    //   }
    // );
  }
}
