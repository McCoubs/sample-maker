import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { AudioWrapper } from '../classes/AudioWrapper';
import { RecorderWrapper } from '../classes/RecorderWrapper';
import { SampleService } from '../sample.service';
import { IgxSliderComponent, ISliderValueChangeEventArgs, SliderType } from 'igniteui-angular';
import { faSpinner, faVolumeMute, faVolumeUp, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { AudioContextEnum } from '../classes/AudioContextEnum';

class AudioRange {constructor(public lower: number, public upper: number) {}}

@Component({
  selector: 'app-sample-creator',
  templateUrl: './sample-creator.component.html',
  styleUrls: ['./sample-creator.component.scss']
})
export class SampleCreatorComponent implements OnInit, AfterViewInit {

  // functionality vars
  audioWrapper: AudioWrapper = null;
  recorder: RecorderWrapper = null;
  recordedAudio: AudioWrapper = null;
  sliderType = SliderType;
  audioRange: AudioRange;
  uploadedFile: File;
  // interaction vars
  audioLoaded: Boolean = false;
  interacting: Boolean = false;
  loading: Boolean = false;
  isPlaying: Boolean = false;
  currentTime = 0;
  @ViewChild('audioTracker')
  private tracker: IgxSliderComponent;
  // font-awesome vars
  faSpinner = faSpinner;
  faVolumeMute = faVolumeMute;
  faVolumeUp = faVolumeUp;
  faMicrophone = faMicrophone;

  constructor(private sampleService: SampleService, private ref: ChangeDetectorRef) {}

  ngOnInit() {
    this.audioWrapper = new AudioWrapper();
  }

  ngAfterViewInit(): void {}

  onFileUpload(file: File): void {
    this.loading = true;
    this.uploadedFile = file;
    // decode input file and start setup
    this.audioWrapper.decodeFile(file, () => {
      const duration = this.audioWrapper.buffer.duration;
      this.audioRange = new AudioRange(Math.floor(duration / 10), Math.floor(duration * 0.9));
      this.audioLoaded = true;
      this.loading = false;
      this.ref.detectChanges();
    });
  }

  ///////// PLAYBACK CONTROL METHODS /////////
  setupPlay() {
    // start playing and create recorder
    this.audioWrapper.startAudio();
    this.recorder = new RecorderWrapper(this.audioWrapper.sourceNode);
    // start listener node
    this.audioWrapper.createProcessorNode((e) => {
      if (!this.interacting) {
        this.currentTime = e.playbackTime;
        this.ref.detectChanges();
      }
    });
    // disable counting when touching to avoid stutter
    this.tracker.registerOnTouched(() => {
      this.interacting = true;
    });
  }

  togglePlaying() {
    // call correct method
    if (!this.recorder) {
      this.setupPlay();
    } else if (this.audioWrapper.audioContext.state === AudioContextEnum.RunningState) {
      this.audioWrapper.pauseAudio();
    } else {
      this.audioWrapper.resumeAudio();
    }
    this.isPlaying = !this.isPlaying;
    this.ref.detectChanges();
  }

  updateCurrentTime(event: ISliderValueChangeEventArgs) {
    // method to help with tracker
    this.currentTime = +event.value;
    this.audioWrapper.stopAudio();
    this.audioWrapper.startAudio(this.currentTime);
    this.interacting = false;
  }

  ///////// EDITING CONTROL METHODS /////////
  applyFilter(type: string, frequency: number, gain: number) {
    if (type && frequency && gain) {
      this.audioWrapper.applyFilter(type, frequency, gain);
      this.ref.detectChanges();
    }
  }

  removeFilter() {
    this.audioWrapper.removeFilter();
    this.ref.detectChanges();
  }

  setPlaybackRate(rate: number) {
    this.audioWrapper.setPlayBackRate(rate);
  }

  applyFadeIn(percent: number) {
    this.audioWrapper.fadeAudioIn(percent);
  }

  applyFadeOut(percent: number) {
    this.audioWrapper.fadeAudioOut(percent);
  }

  setPan(value) {
    this.audioWrapper.setPan(value);
  }

  changeVolume(volume) {
    this.audioWrapper.setVolume(volume);
  }

  ///////// RECORDING CONTROL METHODS /////////
  toggleRecording() {
    if (this.recorder.recording) {
      this.stopRecording();
    } else {
      this.record();
    }
  }

  record() {
    // reset temp recording
    if (this.recordedAudio) {
      this.recordedAudio.stopAudio();
      this.recordedAudio = null;
    }
    // begin recording
    this.recorder.record();
  }

  stopRecording() {
    this.recorder.stop();
    // save current recorded setPlaybackRate
    this.recordedAudio = new AudioWrapper();
    this.recordedAudio.buffer = this.recorder.getBuffer();
  }

  playRecording() {
    this.recordedAudio.stopAudio();
    this.recordedAudio.startAudio();
  }

  pauseRecording() {
    this.recordedAudio.pauseAudio();
  }

  resetRecording() {
    this.recorder.reset();
    this.recordedAudio.stopAudio();
    this.recordedAudio = null;
    this.ref.detectChanges();
  }

  saveRecording(name: string) {
    // get default
    if (!name || name === '') {
      name = this.uploadedFile.name;
    }
    // remove ending if provided
    name = name.split('.')[0];
    // save recording
    const file = this.recordedAudio.convertToFile(name);
    this.sampleService.createSample(file, {}).subscribe(
        (data) => {
          console.log(data);
          alert('new sample: ' + name + ' successfully saved');
        },
        (error) => console.log(error)
    );
  }

  downloadRecording(name: string) {
    // get default
    if (!name || name === '') {
      name = this.uploadedFile.name;
    }
    // remove ending if provided
    name = name.split('.')[0];
    this.recordedAudio.downloadAudio(name);
  }
}
