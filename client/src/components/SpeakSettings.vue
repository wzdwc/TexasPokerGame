<template>
  <div class="speak-settings" v-show="showSpeakSettings">
    <div class="shadow" @click="closeSpeakSettings"></div>
    <div class="speak-settings-body">
      <h3>一. 可用中文语音包</h3>
      <ul v-if="voices.length > 0" class="voice-list">
        <li
          v-for="voice in voices"
          :key="voice.name"
          :class="{ 'selected-voice': selectedVoice === voice.name }"
          @click="testVoice(voice)"
        >
          {{ voice.name }} ({{ voice.lang }})
        </li>
      </ul>
      <p v-else>没有可用的中文语音包</p>
      <h3>二. 语音播放场景</h3>
      <div class="option">
        <label>
          <input type="checkbox" v-model="playReminderSound" @change="saveSettings" />
          轮到你执行操作时
        </label>
      </div>

      <div class="option">
        <label>
          <input type="checkbox" v-model="playMessageSound" @change="saveSettings" />
          别人发送消息语音时
        </label>
      </div>

      <div class="option">
        <label>
          <input type="checkbox" v-model="playRaiseReminderSound" @change="saveSettings" />
          到你时提示别人的Raise
        </label>
      </div>
      <h3>三. 语音播放额外设置</h3>
      <div class="option">
        <label>
          <input type="checkbox" v-model="isRandomVoice" @change="saveSettings" />
          随机语音模式
        </label>
      </div>
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
  private playReminderSound: boolean = true;
  private playMessageSound: boolean = true;
  private playRaiseReminderSound: boolean = true;
  private isRandomVoice: boolean = false;

  private mounted() {
    this.fetchVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = this.fetchVoices;
    }
    this.loadSelectedVoice();
    this.loadSettings();
  }

  private loadSettings() {
    const reminderSetting = localStorage.getItem('playReminderSound');
    const messageSetting = localStorage.getItem('playMessageSound');
    const raiseReminderSetting = localStorage.getItem('playRaiseReminderSound');
    const isRandomVoice = localStorage.getItem('tts:isRandomVoice');

    this.playReminderSound = reminderSetting !== null ? reminderSetting === 'true' : true;
    this.playMessageSound = messageSetting !== null ? messageSetting === 'true' : true;
    this.playRaiseReminderSound = raiseReminderSetting !== null ? raiseReminderSetting === 'true' : true;
    this.isRandomVoice = isRandomVoice !== null ? isRandomVoice === 'true' : false;
  }

  private saveSettings() {
    localStorage.setItem('playReminderSound', this.playReminderSound.toString());
    localStorage.setItem('playMessageSound', this.playMessageSound.toString());
    localStorage.setItem('playRaiseReminderSound', this.playRaiseReminderSound.toString());
    localStorage.setItem('tts:isRandomVoice', this.isRandomVoice.toString());
  }

  private fetchVoices() {
    this.voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith('zh'));
  }

  private testVoice(voice: SpeechSynthesisVoice) {
    const utterance = new SpeechSynthesisUtterance('牌友，你好啊');
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
    top: 20%;
    transform: translate(-50%, -150px);
    width: 90%;
    height: 90%;
    border-radius: 12px;
    box-sizing: border-box;
    background: #fff;
    padding: 20px;
    overflow-y: auto;

    h3:not(:first-of-type) {
      padding-top: 30px;
    }

    .voice-list {
      max-height: 200px;
      /* Adjust the height as needed */
      overflow-y: auto;
    }

    .selected-voice {
      font-weight: bold;
    }
  }

  .option {
    margin-top: 10px;
  }
}
</style>
