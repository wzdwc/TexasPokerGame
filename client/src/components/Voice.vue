<template>
  <div class="voice" v-show="isSupported" @contextmenu.stop.prevent="() => null">
    <span class="voice-input" @touchstart="onStart">🎙️</span>
    <div class="voice-indicator" v-show="isRecording">
      {{ isRecording ? 'recording' : '' }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
declare var MediaRecorder: any;

@Component
export default class Voice extends Vue {
  public isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  private mediaStream!: MediaStream | null;
  private mediaRecorder!: any;
  private isRecording = false;

  public stop() {
    this.mediaRecorder?.stop();
    this.isRecording = false;
  }

  private onStart() {
    if (this.isRecording) {
      return;
    }

    if (this.mediaRecorder) {
      this.isRecording = true;
      return this.mediaRecorder.start();
    }

    navigator.mediaDevices
    .getUserMedia(
      {
        audio: true,
      },
    ).then((stream) => {

      let chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream, {
        audioBitsPerSecond: 16000,
      });
      mediaRecorder.start();
      mediaRecorder.ondataavailable = (e: any) => {
        chunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        if (chunks.length > 0) {
          this.$emit('audio', { data: chunks, options: { type: mediaRecorder.mimeType }});
          chunks = [];
        }
      };

      document.addEventListener('touchend', this.stop);

      this.isRecording = true;
      this.mediaStream = stream;
      this.mediaRecorder = mediaRecorder;
    }).catch((err) => {
      console.log('The following getUserMedia error occured: ' + err);
    });
  }

  private beforeDestroy() {
    this.mediaRecorder = null;
    this.mediaStream?.getTracks()?.forEach((track) => track.stop());
    this.mediaStream = null;
    document.removeEventListener('touchend', this.stop);
  }
}
</script>

<style lang="less" scoped>
  .voice {
    display: inline-block;
    position: relative;
    user-select: none !important;
  }

  .voice-input {
    padding: 0 12px;
    font-size: 24px;
    cursor: pointer;
  }

  .voice-indicator {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 60px;
    font-weight: bold;
    color: white;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
