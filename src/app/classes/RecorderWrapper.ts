import { AudioWrapper } from './AudioWrapper';

export class RecorderWrapper {

  recording: Boolean = false;
  bufferLen: number;
  node: ScriptProcessorNode = null;
  source: AudioBufferSourceNode = null;
  context: BaseAudioContext;
  recordedLength = 0;
  recordedLeftBuffers: Array<Float32Array> = [];
  recordedRightBuffers: Array<Float32Array> = [];

  constructor(source: AudioBufferSourceNode, audioWrapper: AudioWrapper) {
    this.bufferLen = 8192;
    // set required vars
    this.context = source.context;
    this.source = source;
    // create a processor node on source
    audioWrapper.createProcessorNode(this.listenHelper.bind(this), 'recorder');
  }

  private listenHelper(e): void {
    if (this.recording) {
      // create 2 arrays to store the incoming channel data
      let left = new Float32Array(this.bufferLen);
      left.set(e.inputBuffer.getChannelData(0));
      let right = new Float32Array(this.bufferLen);
      right.set(e.inputBuffer.getChannelData(1));
      // record the channel data
      this.recordedLeftBuffers.push(left);
      this.recordedRightBuffers.push(right);
      this.recordedLength += left.length;
    }
  }

  record(): void {
    this.recording = true;
  }

  stop(): void {
    this.recording = false;
  }

  reset(): void {
    this.recordedLength = 0;
    this.recordedLeftBuffers = [];
    this.recordedRightBuffers = [];
    this.recording = false;
  }

  getBuffer(): AudioBuffer {
    // merge the left and right buffers into 1 each
    const left = this.mergeBuffers(this.recordedLeftBuffers, this.recordedLength);
    const right = this.mergeBuffers(this.recordedRightBuffers, this.recordedLength);
    // create new buffer and set channel data
    const newBuffer = this.context.createBuffer(2, this.recordedLength, this.context.sampleRate);
    newBuffer.getChannelData(0).set(left);
    newBuffer.getChannelData(1).set(right);
    return newBuffer;
  }

  private mergeBuffers(recordedBuffers: Array<Float32Array>, recLength: number): Float32Array {
    // create result buffer
    const result = new Float32Array(recLength);
    let offset = 0;
    // for each buffer recorded, insert into result
    for (let i = 0; i < recordedBuffers.length; i++) {
      result.set(recordedBuffers[i], offset);
      offset += recordedBuffers[i].length;
    }
    return result;
  }
}
