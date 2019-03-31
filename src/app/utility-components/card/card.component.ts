import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Sample } from '../../classes/sample';
import { SampleService } from '../../global-services/sample.service';
import { AudioWrapper } from '../../classes/AudioWrapper';
import { UserService } from '../../global-services/user.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { User } from '../../classes/user';
import { NotifierService } from 'angular-notifier';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnDestroy {

  _author: string;
  _sample: Sample;
  playing: Boolean;
  audioTrack: AudioWrapper;
  faTrash = faTrash;
  _currentUser: User = null;
  @Output() sampleDeleted = new EventEmitter<Sample>();

  @Input()
  set sample(sample: Sample) {
    this._sample = sample;
    this.playing = false;
  }

  constructor(private sampleService: SampleService, private userService: UserService, private notifierService: NotifierService) {
    this._currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    this.userService.getUser(this._sample.author).subscribe(
      (user) => {
        this._author = user.name;
      }
    );
  }

  ngOnDestroy() {
    if (this.audioTrack) this.audioTrack.stopAudio();
  }

  play() {
    if (!this.audioTrack) this.getTrack('play');
    else if (!this.playing) {
      this.playing = true;
      this.audioTrack.startAudio();
    } else {
      this.playing = false;
      this.audioTrack.stopAudio();
    }
  }

  download() {
    if (!this.audioTrack) this.getTrack('dl');
    else this.audioTrack.downloadAudio(this._sample.name);
  }

  getTrack(option) {
    this.sampleService.downloadSample(this._sample._id).subscribe(
      (arrayBuffer) => {
        this.audioTrack = new AudioWrapper();
        this.audioTrack.decodeArrayBuffer(arrayBuffer, () => {
          if (option === 'play') {
            this.playing = true;
            this.audioTrack.startAudio();
          } else this.audioTrack.downloadAudio(this._sample.name);
        });
      }
    );
  }

  delete() {
    this.sampleService.deleteSample(this._sample._id).subscribe((value) => {
      this.sampleDeleted.emit(this._sample);
      this.notifierService.notify('success', 'Successfully deleted sample: ' + this._sample.name);
    });
  }
}
