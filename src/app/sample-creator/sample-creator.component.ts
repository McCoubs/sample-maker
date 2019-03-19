import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AudioWrapper } from '../classes/AudioWrapper';
import { RecorderWrapper } from '../classes/RecorderWrapper';
import { SampleService } from '../sample.service';
import { IgxSliderComponent, ISliderValueChangeEventArgs, SliderType } from 'igniteui-angular';
import { faSpinner, faVolumeMute, faVolumeUp, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { AudioContextEnum } from '../classes/AudioContextEnum';
import { NotifierService } from 'angular-notifier';

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

  constructor(private sampleService: SampleService, private notifierService: NotifierService, private ref: ChangeDetectorRef) {}

  ngOnInit() {
    this.audioWrapper = new AudioWrapper();
  }

  ngAfterViewInit(): void {}

  onFileUpload(file: File): void {
    this.loading = true;
    this.uploadedFile = file;
    // decode input file and start setup
    this.audioWrapper.decodeFile(file, () => {
      // load audio and recorder
      this.audioWrapper.loadAudio();
      this.recorder = new RecorderWrapper(this.audioWrapper.sourceNode);
      // start listener node
      this.audioWrapper.createProcessorNode((e) => {
        if (!this.interacting || !this.isPlaying) {
          this.currentTime = e.playbackTime;
          this.ref.detectChanges();
        }
      });
      // initialize vars
      const duration = this.audioWrapper.buffer.duration;
      this.audioRange = new AudioRange(Math.floor(duration / 10), Math.floor(duration * 0.9));
      this.audioLoaded = true;
      this.loading = false;
      this.ref.detectChanges();

      // disable counting when touching to avoid stutter
      this.tracker.registerOnTouched(() => {
        this.interacting = true;
      });
    });
  }

  ///////// PLAYBACK CONTROL METHODS /////////
  togglePlaying(): void {
    // call correct method
    if (this.audioWrapper.loaded) {
      this.audioWrapper.startAudio();
    } else if (this.audioWrapper.audioContext.state === AudioContextEnum.RunningState) {
      this.audioWrapper.pauseAudio();
    } else {
      this.audioWrapper.resumeAudio();
    }
    this.isPlaying = !this.isPlaying;
    this.ref.detectChanges();
  }

  restartPlay(): void {
    // restart play
    this.audioWrapper.stopAudio();
    this.audioWrapper.startAudio();
    this.isPlaying = true;
    // re-intialize recorder
    this.recorder.createProcessor(this.audioWrapper.sourceNode);
  }

  updateCurrentTime(event: ISliderValueChangeEventArgs): void {
    // method to help with tracker
    this.currentTime = +event.value;
    this.audioWrapper.stopAudio();
    this.audioWrapper.startAudio(this.currentTime);
    this.interacting = false;
  }

  ///////// EDITING CONTROL METHODS /////////
  applyFilter(type: string, frequency: number, gain: number): void {
    if (type && frequency && gain) {
      this.audioWrapper.applyFilter(type, frequency, gain);
      this.ref.detectChanges();
    }
  }

  removeFilter(): void {
    this.audioWrapper.removeFilter();
    this.ref.detectChanges();
  }

  setPlaybackRate(rate: number): void {
    this.audioWrapper.setPlayBackRate(rate);
  }

  applyFadeIn(percent: number): void {
    this.audioWrapper.fadeAudioIn(percent);
    this.audioWrapper.startAudio();
  }

  applyFadeOut(percent: number): void {
    this.audioWrapper.fadeAudioOut(percent);
    this.audioWrapper.startAudio();
  }

  setPan(value): void {
    this.audioWrapper.setPan(value);
  }

  changeVolume(volume): void {
    this.audioWrapper.setVolume(volume);
  }

  mutateAudio(type: 'cut' | 'leave' | 'paste'): void {
    this.isPlaying = false;
    if (type === 'cut') {
      this.audioWrapper.cut(this.audioRange.lower, this.audioRange.upper);
    } else if (type === 'leave') {
      this.audioWrapper.leave(this.audioRange.lower, this.audioRange.upper);
    }
    // re-initialize recorder
    this.audioWrapper.loadAudio();
    this.recorder.createProcessor(this.audioWrapper.sourceNode);
    // re-initialize slider vars
    const duration = this.audioWrapper.buffer.duration;
    this.audioRange = new AudioRange(Math.floor(duration / 10), Math.floor(duration * 0.9));
    this.ref.detectChanges();
  }

  ///////// RECORDING CONTROL METHODS /////////
  toggleRecording(): void {
    if (this.recorder.recording) {
      this.stopRecording();
    } else {
      this.record();
    }
    this.ref.detectChanges();
  }

  record(): void {
    // reset temp recording
    if (this.recordedAudio) {
      this.recordedAudio.stopAudio();
      this.recordedAudio = null;
    }
    // begin recording
    this.recorder.record();
  }

  stopRecording(): void {
    this.recorder.stop();
    // save current recorded setPlaybackRate
    this.recordedAudio = new AudioWrapper();
    this.recordedAudio.buffer = this.recorder.getBuffer();
  }

  playRecording(): void {
    this.recordedAudio.stopAudio();
    this.recordedAudio.startAudio();
  }

  resetRecording(): void {
    this.recorder.reset();
    this.recordedAudio.stopAudio();
    this.recordedAudio = null;
    this.ref.detectChanges();
  }

  saveRecording(name: string): void {
    // get default
    if (!name || name === '') {
      name = this.uploadedFile.name;
    }
    // save recording
    const file = this.recordedAudio.convertToFile(name);
    this.sampleService.createSample(file, {}).subscribe(
        (sample) => {
          this.notifierService.notify('success', 'New sample: ' + sample.name + ' successfully saved');
        },
        (error) => console.log(error)
    );
  }

  downloadRecording(name: string): void {
    // get default
    if (!name || name === '') {
      name = this.uploadedFile.name;
    }
    this.recordedAudio.downloadAudio(name);
  }
}
