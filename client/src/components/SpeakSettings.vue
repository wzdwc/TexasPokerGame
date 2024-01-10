<template>
  <div class="speak-settings" v-show="showSpeakSettings">
    <div class="shadow" @click="closeSpeakSettings"></div>
    <div class="speak-settings-body">
      <ul class="voice-list">
        <li v-for="voice in voices" 
            :key="voice.name" 
            :class="{ 'selected-voice': selectedVoice === voice.name }" 
            @click="testVoice(voice)">
          {{ voice.name }} ({{ voice.lang }})
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class SpeakSettings extends Vue {
  @Prop() private showSpeakSettings!: boolean;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: string | null = null;

  mounted() {
    this.fetchVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = this.fetchVoices;
    }
    this.loadSelectedVoice();
  }

  private fetchVoices() {
    this.voices = window.speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('zh'));
  }

  private testVoice(voice: SpeechSynthesisVoice) {
    const utterance = new SpeechSynthesisUtterance("牌友，你好啊");
    utterance.voice = voice;
    window.speechSynthesis.speak(utterance);

    this.selectedVoice = voice.name;
    this.saveSelectedVoice(voice);
  }

  private saveSelectedVoice(voice: SpeechSynthesisVoice) {
    localStorage.setItem('selectedVoice', voice.name);
  }

  private loadSelectedVoice() {
    this.selectedVoice = localStorage.getItem('selectedVoice');
  }

  private closeSpeakSettings() {
    this.$emit('update:showSpeakSettings', false);
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.speak-settings {
  position: fixed;
  z-index: 99;

  .shadow {
    position: fixed;
    z-index: 9;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
  }

  .speak-settings-body {
    z-index: 99;
    position: fixed;
    left: 50%;
    top: 50%;
    margin: -100px -150px;
    width: 300px;
    border-radius: 12px;
    box-sizing: border-box;
    background: #fff;
    padding: 20px;

    .voice-list {
      max-height: 200px;
      /* Adjust the height as needed */
      overflow-y: auto;
    }

    .selected-voice {
      font-weight: bold;
    }
  }
}
</style>
