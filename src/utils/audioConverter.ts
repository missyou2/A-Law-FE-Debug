import { Mp3Encoder } from '@breezystack/lamejs';

function floatTo16BitPCM(float32: Float32Array): Int16Array {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i] as number));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

export async function convertBlobToMp3(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  await audioCtx.close();

  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const encoder = new Mp3Encoder(numChannels, sampleRate, 128);
  const blockSize = 1152;
  const mp3Chunks: Uint8Array[] = [];

  if (numChannels === 1) {
    const pcm = floatTo16BitPCM(audioBuffer.getChannelData(0));
    for (let i = 0; i < pcm.length; i += blockSize) {
      const chunk = encoder.encodeBuffer(pcm.subarray(i, i + blockSize));
      if (chunk.length > 0) mp3Chunks.push(chunk);
    }
  } else {
    const leftPcm = floatTo16BitPCM(audioBuffer.getChannelData(0));
    const rightPcm = floatTo16BitPCM(audioBuffer.getChannelData(1));
    for (let i = 0; i < leftPcm.length; i += blockSize) {
      const chunk = encoder.encodeBuffer(
        leftPcm.subarray(i, i + blockSize),
        rightPcm.subarray(i, i + blockSize),
      );
      if (chunk.length > 0) mp3Chunks.push(chunk);
    }
  }

  const final = encoder.flush();
  if (final.length > 0) mp3Chunks.push(final);

  return new Blob(mp3Chunks as BlobPart[], { type: 'audio/mpeg' });
}
