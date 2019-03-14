export class RecorderWrapper {

  recording: Boolean = false;
  bufferLen: number;
  node: ScriptProcessorNode;
  context: BaseAudioContext;
  recordedLength = 0;
  recordedLeftBuffers: Array<Float32Array> = [];
  recordedRightBuffers: Array<Float32Array> = [];

  constructor(source: AudioNode, bufferLen?: number) {
    // create processor node
    this.bufferLen = bufferLen || 8192;
    this.context = source.context;
    this.node = this.context.createScriptProcessor(this.bufferLen, 2, 2);

    // listen and push channel data
    this.node.onaudioprocess = (e) => {
      if (this.recording) {
        // create 2 arrays to store the incoming channel data
        let left = new Float32Array(8192);
        left.set(e.inputBuffer.getChannelData(0));
        let right = new Float32Array(8192);
        right.set(e.inputBuffer.getChannelData(1));
        // record the channel data
        this.recordedLeftBuffers.push(left);
        this.recordedRightBuffers.push(right);
        this.recordedLength += left.length;
      }
    };

    // connect processor to output
    source.connect(this.node);
    this.node.connect(this.context.destination);
  }

  record() {
    this.recording = true;
  }

  stop() {
    this.recording = false;
  }

  clear() {
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
    const newBuffer = this.context.createBuffer( 2, this.recordedLength, this.context.sampleRate );
    newBuffer.getChannelData(0).set(left);
    newBuffer.getChannelData(1).set(right);
    return newBuffer;
  }

  convertToFile(name: string): File {
    // merge the left and right buffer lists and then interweave them
    const left = this.mergeBuffers(this.recordedLeftBuffers, this.recordedLength);
    const right = this.mergeBuffers(this.recordedRightBuffers, this.recordedLength);
    const total = this.interweaveChannels(left, right);

    return <File>(new Blob([total]));
  }

  mergeBuffers(recordedBuffers, recLength: number): Float32Array {
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

  interweaveChannels(leftChannel, rightChannel): Float32Array {
    // creates a new array large enough for left + right
    let length = leftChannel.length + rightChannel.length;
    let result = new Float32Array(length);
    let index = 0, inputIndex = 0;
    // interweave both halves
    while (index < length) {
      result[index++] = leftChannel[inputIndex];
      result[index++] = rightChannel[inputIndex];
      inputIndex++;
    }
    return result;
  }
}
