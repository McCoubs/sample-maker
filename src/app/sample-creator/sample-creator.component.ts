import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { AudioWrapper } from '../classes/AudioWrapper';
import { RecorderWrapper } from '../classes/RecorderWrapper';
import { SampleService } from '../sample.service';
import { IgxSliderComponent, ISliderValueChangeEventArgs, SliderType } from 'igniteui-angular';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

class AudioRange {constructor(public lower: number, public upper: number) {}}

@Component({
  selector: 'app-sample-creator',
  templateUrl: './sample-creator.component.html',
  styleUrls: ['./sample-creator.component.scss']
})
export class SampleCreatorComponent implements OnInit, AfterViewInit {

  audioWrapper: AudioWrapper = null;
  recorder: RecorderWrapper = null;
  recordedAudio: AudioWrapper = null;
  public sliderType = SliderType;
  audioRange: AudioRange;
  audioLoaded: Boolean = false;
  currentTime = 0;
  interacting: Boolean = false;
  loading: Boolean = false;
  faSpinner = faSpinner;

  @ViewChild('audioTracker')
  private tracker: IgxSliderComponent;

  constructor(private sampleService: SampleService, private ref: ChangeDetectorRef) {}

  ngOnInit() {
    this.audioWrapper = new AudioWrapper();
  }

  ngAfterViewInit(): void {}

  onFileUpload(file) {
    this.loading = true;
    this.audioWrapper.decodeFile(file, () => {
      const duration = this.audioWrapper.buffer.duration;
      this.audioRange = new AudioRange(Math.floor(duration / 10), Math.floor(duration * 0.9));
      this.audioLoaded = true;
      this.loading = false;
      this.ref.detectChanges();
    });
  }

  ///////// PLAYBACK CONTROL METHODS /////////
  play() {
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

  pause() {
    this.audioWrapper.pauseAudio();
  }

  resume() {
    this.audioWrapper.resumeAudio();
  }

  updateCurrentTime(event: ISliderValueChangeEventArgs) {
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
    this.recordedAudio.startAudio();
  }

  pauseRecording() {
    this.recordedAudio.pauseAudio();
  }

  resetRecording() {
    this.recorder.reset();
    this.recordedAudio.stopAudio();
    this.recordedAudio = null;
  }

  saveRecording(name: string) {
    // this code saves into db
    const file = this.recordedAudio.convertToFile(name);
    this.sampleService.createSample(file, {}).subscribe(
        (data) => {
          console.log(data);
          /*this.sampleService.downloadSample(data._id).subscribe(
              (arrayBuffer) => {
                debugger;
                const test = new AudioWrapper();
                test.decodeArrayBuffer(arrayBuffer, () => test.startAudio());
              },
              (error) => console.log(error));*/
        },
        (error) => console.log(error)
    );
  }

  downloadRecording(name: string) {
    this.recordedAudio.downloadAudio(name);
  }
}
