<template>
  <div class="voice" v-show="isSupported" @contextmenu.stop.prevent="() => null">
    <span class="voice-input" @touchstart="onStart" @mousedown="onStart">🎙️</span>
    <div class="voice-indicator" v-show="isRecording">
      {{ isRecording ? 'recording' : '' }}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Recorder from 'recorder-core';
import 'recorder-core/src/engine/mp3';
import 'recorder-core/src/engine/mp3-engine';
// 可选的扩展
import 'recorder-core/src/extensions/waveview';

@Component
export default class Voice extends Vue {
  public isSupported = Recorder.Support();
  private mediaRecorder!: ReturnType<typeof Recorder> | null;
  private isRecording = false;

  public stop() {
    this.mediaRecorder?.stop((blob: Blob, duration: number) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.$emit('audio', { data: reader.result, duration });
      };
      reader.readAsDataURL(blob);
      this.mediaRecorder?.close();
      this.mediaRecorder = null;
    });
    this.isRecording = false;
  }

  private onStart() {
    if (this.isRecording) {
      return;
    }

    const mediaRecorder = Recorder({
      type: 'mp3',
      bitRate: 32,
      sampleRate: 16000,
    });

    mediaRecorder.open(() => {
      this.isRecording = true;
      mediaRecorder.start();
      document.addEventListener('touchcancel', this.stop);
      document.addEventListener('touchend', this.stop);
      document.addEventListener('mouseup', this.stop);
    }, (errMsg: string, isUserNotAllow: boolean) => {
      console.log('open recorder error: ', errMsg, isUserNotAllow && 'user not allow');
    });

    this.mediaRecorder = mediaRecorder;
  }

  private beforeDestroy() {
    this.mediaRecorder?.close();
    this.mediaRecorder = null;
    document.removeEventListener('touchcancel', this.stop);
    document.removeEventListener('touchend', this.stop);
    document.removeEventListener('mouseup', this.stop);
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
