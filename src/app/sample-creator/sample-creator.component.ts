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

  ngAfterViewInit(): void {

  }

  onFileUpload(file) {
    this.audioWrapper.decodeFile(file, () => {
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

  listenToRecording() {
    this.audioWrapper.pauseAudio();

    // testing playback
    this.recordedAudio = new AudioWrapper();
    this.recordedAudio.buffer = this.recorder.getBuffer();
    this.recordedAudio.startAudio();
  }

  saveRecording(name: string) {
    // this code saves into db
    const file = this.recordedAudio.convertToFile(name);
    this.sampleService.createSample(file, {}).subscribe(
        (data) => console.log(data),
        (error) => console.log(error)
    );
  }

  downloadAudio(name: string) {
    saveAs(this.recordedAudio.convertToFile(name));
  }
}
