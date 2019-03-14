import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AudioWrapper } from '../classes/AudioWrapper';
import { RecorderWrapper } from '../classes/RecorderWrapper';

@Component({
  selector: 'app-sample-creator',
  templateUrl: './sample-creator.component.html',
  styleUrls: ['./sample-creator.component.scss']
})
export class SampleCreatorComponent implements OnInit, AfterViewInit {

  audioWrapper: AudioWrapper = null;
  recorder: RecorderWrapper = null;

  constructor() {}

  ngOnInit() {
    this.audioWrapper = new AudioWrapper();
  }

  ngAfterViewInit(): void {

  }

  onFileUpload(file) {
    this.audioWrapper.readFile(file, () => {
      alert('ready for interaction');
    });
  }

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

  applyFilter() {
    this.audioWrapper.applyFilter('highpass', 100, 0.5);
  }

  playback() {
    this.audioWrapper.setPlayBackRate(3);
  }

  fade() {
    this.audioWrapper.fadeAudioIn(10);
  }

  pan(value) {
    this.audioWrapper.setPan(value);
  }

  record() {
    this.recorder.record();
  }

  stopRecording() {
    this.recorder.stop();
  }

  exportRecording() {
    this.audioWrapper.pauseAudio();

    const testAudio = new AudioWrapper();
    const newBuffer = this.recorder.getBuffer();
    testAudio.buffer = newBuffer;
    testAudio.startAudio();

    console.log(this.recorder.convertToFile('test'));
  }
}
