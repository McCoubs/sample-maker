import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AudioWrapper } from '../classes/AudioWrapper';
import { RecorderWrapper } from '../classes/RecorderWrapper';
import { SampleService } from '../sample.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-sample-creator',
  templateUrl: './sample-creator.component.html',
  styleUrls: ['./sample-creator.component.scss']
})
export class SampleCreatorComponent implements OnInit, AfterViewInit {

  audioWrapper: AudioWrapper = null;
  recorder: RecorderWrapper = null;
  recordedAudio: AudioWrapper = null;

  constructor(private sampleService: SampleService) {}

  ngOnInit() {
    this.audioWrapper = new AudioWrapper();
  }

  ngAfterViewInit(): void {}

  onFileUpload(file) {
    this.audioWrapper.decodeFile(file, () => {
      alert('ready for interaction');
    });
  }

  ///////// PLAYBACK CONTROL METHODS /////////
  play() {
    this.audioWrapper.startAudio();
    this.recorder = new RecorderWrapper(this.audioWrapper.sourceNode);
  }

  pause() {
    this.audioWrapper.pauseAudio();
  }

  resume() {
    this.audioWrapper.resumeAudio();
  }

  ///////// EDITING CONTROL METHODS /////////
  applyFilter(type: string, frequency: number, gain: number) {
    this.audioWrapper.applyFilter(type, frequency, gain);
  }

  setPlaybackRate(rate: number) {
    this.audioWrapper.setPlayBackRate(rate);
  }

  applyFadeIn(percent: number) {
    this.audioWrapper.fadeAudioIn(percent);
  }

  pan(value) {
    this.audioWrapper.setPan(value);
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
    // start if not started, else resume
    if (this.recordedAudio.sourceNode) {
      this.recordedAudio.resumeAudio();
    } else {
      this.recordedAudio.startAudio();
    }
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
    saveAs(this.recordedAudio.convertToFile(name));
  }
}
