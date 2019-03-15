import { isNullOrUndefined } from 'util';
declare var AudioContext, webkitAudioContext, mozAudioContext: any;
import { AudioContextEnum } from './AudioContextEnum';
import { audioBufferToWav } from 'audiobuffer-to-wav';

/**
 * Class abstracts the web audio API for use
 */
export class AudioWrapper {

  audioContext: AudioContext;
  buffer: AudioBuffer;
  sourceNode: AudioBufferSourceNode = null;
  gainNode: GainNode;
  pannerNode: PannerNode;
  filterNode: BiquadFilterNode = null;
  // used to keep track of the head of the audio pipeline
  connectNode: AudioNode;

  // currently unused nodes
  oscillatorNode: OscillatorNode;
  analyserNode: AnalyserNode;

  constructor(buffer?: AudioBuffer) {
    // set audio context
    this.audioContext = new (AudioContext || webkitAudioContext || mozAudioContext)();
    this.buffer = buffer;

    // create basic audio api nodes
    this.gainNode = this.audioContext.createGain();
    this.pannerNode = this.audioContext.createPanner();

    // connect base nodes
    this.gainNode.connect(this.audioContext.destination);
    this.pannerNode.connect(this.gainNode);

    this.connectNode = this.pannerNode;
  }

  decodeFile(file: File, callback?: Function): void {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.decodeArrayBuffer(<ArrayBuffer> fileReader.result, callback);
    };
    fileReader.readAsArrayBuffer(file);
  }

  decodeArrayBuffer(arrayBuffer: ArrayBuffer, callback?: Function): void {
    this.audioContext.decodeAudioData(arrayBuffer, (buffer) => {
      this.buffer = buffer;
      if (callback) { callback(); }
    });
  }

  convertToFile(name: string): File {
    return new File([audioBufferToWav(this.buffer, {})], name + '.wav', {type: 'audio/wav'});
  }

  /**
   * Adds analyzer node for visualization
   */
  createAnalyzer() {
    // create and connect analyzer
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.connect(this.connectNode);
    this.connectNode = this.analyserNode;
  }

  /**
   * adds a filter to audio pipeline
   *  example filters: 'highpass', 2000, 0; 'lowpass', 1500, 0
   */
  applyFilter(type, freq, gain) {
    this.pauseAudio();
    this.filterNode = this.audioContext.createBiquadFilter();

    // apply filter variables
    this.filterNode.type = type;
    this.filterNode.frequency.value = freq;
    this.filterNode.gain.value = gain;

    // connect filter into audio pipeline
    this.filterNode.connect(this.connectNode);
    this.connectNode = this.filterNode;

    this.resumeAudio();
  }

  /**
   * Removes the current filter from pipeline
   */
  removeFilter() {
    this.pauseAudio();

    // if there is a current filter, remove it and reset head of audio pipeline
    if (this.filterNode !== null) {
      this.filterNode.disconnect();
      this.connectNode = this.pannerNode;
      this.filterNode = null;
    }
    this.resumeAudio();
  }

  /**
   * function applies a simplistic linear fade-in to first percent of audio
   */
  fadeAudioIn(percent): void {
    this.stopAudio();

    // get required info to build new buffer
    const buffer = this.buffer;
    const originalFrames = buffer.length;
    const channelsCount = buffer.numberOfChannels;
    // get amount of frames to fade-in
    const fadedFramesCount = Math.floor(originalFrames / percent);
    // create new buffer with same data
    const newBuffer = this.audioContext.createBuffer(channelsCount, originalFrames, this.audioContext.sampleRate);

    // copy over old channel data, overwriting first percent frames
    for (let channel = 0; channel < channelsCount; channel++) {
      // get channel data
      const oldBufferChannelData = buffer.getChannelData(channel);
      const nowBuffer = newBuffer.getChannelData(channel);

      for (let i = 0; i < originalFrames; i++) {
        // apply naive linear fade in
        if (i < fadedFramesCount) {
          nowBuffer[i] = oldBufferChannelData[i] * (i / fadedFramesCount);
        // else copy old data into buffer
        } else {
          nowBuffer[i] = oldBufferChannelData[i];
        }
      }
    }
    this.buffer = newBuffer;
  }

  /**
   * function applies a simplistic linear fade-out to last percent of audio
   */
  fadeAudioOut(percent): void {
    this.stopAudio();

    // get required info to build new buffer
    const buffer = this.buffer;
    const originalFrames = buffer.length;
    const channelsCount = buffer.numberOfChannels;
    // get amount of frames to fade-out
    const fadedFramesCount = Math.floor(originalFrames / percent);
    // create new buffer with same data
    const newBuffer = this.audioContext.createBuffer(channelsCount, originalFrames, this.audioContext.sampleRate);

    // copy over old channel data, overwriting last percent frames
    for (let channel = 0; channel < channelsCount; channel++) {
      // get channel data
      const oldBufferChannelData = buffer.getChannelData(channel);
      const nowBuffer = newBuffer.getChannelData(channel);

      for (let i = 0; i < originalFrames; i++) {
        // apply naive linear fade out
        if (i >= originalFrames - fadedFramesCount) {
          const distance = i - (originalFrames - fadedFramesCount);
          nowBuffer[i] = oldBufferChannelData[i] * ((fadedFramesCount - distance) / fadedFramesCount);
        // else copy old data into buffer
        } else {
          nowBuffer[i] = oldBufferChannelData[i];
        }
      }
    }
    this.buffer = newBuffer;
  }

  setPan(range: number): void {
    // calculates 3D pan for panner
    let zDeg = range + 90;
    if (zDeg > 90) {
      zDeg = 180 - zDeg;
    }

    const x = Math.sin(range * (Math.PI / 180));
    const z = Math.sin(zDeg * (Math.PI / 180));
    this.pannerNode.setPosition(x, 0, z);
  }

  /**
   * Initializes first time audio play
   */
  startAudio(): void {
    if (this.sourceNode === null && !isNullOrUndefined(this.buffer)) {
      // create new audio source
      this.sourceNode = this.audioContext.createBufferSource();
      this.sourceNode.connect(this.connectNode);
      // set buffer and start playback
      this.sourceNode.buffer = this.buffer;
      this.sourceNode.start(0);
      this.audioContext.resume();
    }
  }

  /**
   * Kills audio play entirely
   */
  stopAudio(): void {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode = null;
    }
  }

  pauseAudio(): void {
    if (this.audioContext.state === AudioContextEnum.RunningState) {
      this.audioContext.suspend();
    }
  }

  resumeAudio(): void {
    if (this.audioContext.state === AudioContextEnum.SuspendedState) {
      this.audioContext.resume();
    }
  }

  setPlayBackRate(rate: number): void {
    this.sourceNode.playbackRate.value = rate;
  }
}
