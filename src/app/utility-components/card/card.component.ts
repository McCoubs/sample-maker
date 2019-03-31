import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Sample } from '../../classes/sample';
import { SampleService } from '../../global-services/sample.service';
import { AudioWrapper } from '../../classes/AudioWrapper';
import { UserService } from '../../global-services/user.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnDestroy {
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

  constructor(private sampleService: SampleService, private userService: UserService) { }

  ngOnInit() {
    this._name = this._sample.name;
    this.userService.getUser(this._sample.author).subscribe(
      (user) => {
        this._author = user.name;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  ngOnDestroy() {
    if(this.audioTrack) this.audioTrack.stopAudio();
  }

  play() {
    if(!this.audioTrack) this.getTrack("play");
    else if(!this.playing){
      this.playing = true;
      this.audioTrack.startAudio();
    } else {
      this.playing = false;
      this.audioTrack.stopAudio();
    }
  }

  download() {
    if(!this.audioTrack) this.getTrack("dl");
    else this.audioTrack.downloadAudio(this._sample.name);
  }

  getTrack(option) {
    this.sampleService.downloadSample(this._sample._id).subscribe(
      (arrayBuffer) => {
        this.audioTrack = new AudioWrapper();
        this.audioTrack.decodeArrayBuffer(arrayBuffer, () => {
          if(option === "play"){
            this.playing = true;
            this.audioTrack.startAudio();
          } else this.audioTrack.downloadAudio(this._sample.name);
        });
      },
      (error) => console.log(error)
    );
  }
}
