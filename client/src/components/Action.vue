<template>
  <div class="action-container">
    <div class="action" v-show="isAction">
      <div class="raise-size">
        <div class="not-allin" v-show="showActionBtn('raise')">
          <i v-for="size in moreSizeMap" @click="raiseOrBet(size)" v-show="showActionSize(size)">
            {{ Math.floor(size) }}</i>
        </div>
      </div>
      <div class="action-type">
        <span class="action-btn" @click="action('fold')">fold</span>
        <span class="action-btn" @click="action('check')" v-show="showActionBtn('check')">check</span>
        <span class="action-btn" @click="action('call')" v-show="showActionBtn('call')">call</span>
        <span class="action-btn" @click="otherSizeHandle()" v-show="showActionBtn('raise')">more</span>
        <span class="action-btn action-btn--allin" @dblclick="action('allin')"
          v-show="!showActionBtn('raise')">ALLIN</span>
      </div>
      <div>
        <iAudio :play="playClick && audioStatus" type="click"></iAudio>
        <iAudio :play="playFold && audioStatus" type="fold"></iAudio>
        <iAudio :play="playRaise && audioStatus" type="raise"></iAudio>
      </div>
    </div>

    <div class="action-other-size" v-if="isRaise">
      <div class="action-other-size-body">
        <div class="size" v-show="currPlayer && moreSize < currPlayer.counter">
          <input type="number" v-model="moreSize" />
        </div>
        <div class="size" v-show="currPlayer && moreSize === currPlayer.counter">Allin</div>
        <range :max="currPlayer && currPlayer.counter" :min="minActionSize" :is-horizontal="true" v-model="moreSize"
          @change="getActionSize"></range>
        <div class="btn" @click="addSize">ok</div>
      </div>
      <div class="shadow" @click="isRaise = false"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import range from './Range.vue';
import iAudio from './Audio.vue';
import { IPlayer } from '@/interface/IPlayer';

@Component({
  components: {
    range,
    iAudio,
  },
})
export default class Action extends Vue {
  @Prop() private isAction: boolean = false;
  @Prop() private minActionSize!: number;
  @Prop() private pot!: number;
  @Prop() private prevSize!: number;
  @Prop() private baseSize!: number;
  @Prop() private isPreFlop!: boolean;
  @Prop() private isTwoPlayer!: boolean;
  @Prop() private currPlayer!: IPlayer;
  @Prop() private audioStatus?: boolean;

  private isRaise = false;
  private moreSize: number = 0;
  private actioned = false;
  private playClick = false;
  private playRaise = false;
  private playFold = false;

  @Watch('isAction')
  private wAction(val: boolean) {
    this.actioned = !val;
    this.playClick = false;
    this.playRaise = false;
    this.playFold = false;
  }

  @Watch('moreSize')
  private wmoreSize(val: number) {
    this.moreSize = val > this.currPlayer.counter ? this.currPlayer.counter : val;
  }

  get moreSizeMap() {
    let size = this.pot > this.baseSize * 4 ? this.pot : this.baseSize * 2;
    if (this.prevSize > 1) {
      size = this.prevSize * 4;
    }
    return size === this.baseSize * 2
      ? [1 * size, 2 * size, 3 * size, 4 * size]
      : [0.5 * size, 0.75 * size, 1 * size, 2 * size];
  }

  get canActionSize() {
    return Number(this.currPlayer && this.currPlayer.counter + this.currPlayer.actionSize);
  }

  private raiseOrBet(size: number) {
    const actionSize = Math.floor(size);
    if (this.prevSize === 0) {
      this.action(`bet:${actionSize}`);
    } else {
      this.action(`raise:${actionSize}`);
    }
  }

  private action(command: string) {
    if (command.indexOf('raise') > -1 || command === 'allin' || command === 'call') {
      this.playRaise = true;
    }
    if (command === 'fold' || command === 'check') {
      this.playFold = true;
    }
    if (!this.actioned) {
      this.actioned = true;
      this.$emit('action', command);
      this.isRaise = false;
      this.actioned = false;
    }
  }

  private showActionSize(multiple: number) {
    return (
      this.currPlayer &&
      this.currPlayer.counter > Math.floor(multiple) &&
      this.prevSize * 2 <= Math.floor(multiple * this.pot) &&
      this.baseSize * 2 <= Math.floor(multiple * this.pot)
    );
  }

  private otherSizeHandle() {
    this.isRaise = true;
    this.moreSize = this.minActionSize;
  }

  private getActionSize(size: number) {
    if (size > this.minActionSize) {
      this.moreSize = size;
    } else {
      this.$plugin.toast('raise size too small');
    }
  }

  private addSize() {
    if (this.moreSize === this.currPlayer?.counter) {
      this.action('allin');
    } else if (this.prevSize === 0) {
      this.action(`bet:${this.moreSize}`);
    } else {
      this.action(`raise:${this.moreSize}`);
    }
  }

  private showActionBtn(type: string) {
    // check
    if ('check' === type) {
      return (
        this.prevSize <= 0 ||
        (this.isPreFlop && this.isTwoPlayer && this.currPlayer?.type === 'd' && this.prevSize === this.baseSize * 2) ||
        (this.currPlayer?.type === 'bb' && this.prevSize === this.baseSize * 2 && this.isPreFlop)
      );
    }
    // raise
    if ('raise' === type) {
      return this.canActionSize > this.prevSize * 2;
    }
    // call
    if ('call' === type) {
      return (
        this.canActionSize > this.prevSize &&
        this.prevSize > 0 &&
        !(
          (this.isPreFlop &&
            this.isTwoPlayer &&
            this.currPlayer?.type === 'd' &&
            this.prevSize === 2 * this.baseSize) ||
          (this.currPlayer?.type === 'bb' && this.prevSize === 2 * this.baseSize && this.isPreFlop)
        )
      );
    }
    return true;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.action-container {
  user-select: none;

  .action {
    position: absolute;
    left: 50%;
    bottom: calc(20% + 50px);
    transform: translateX(-50%);
    color: #fff;

    @media (min-height: 800px) {
      top: calc(50% + 70px);
    }

    .raise-size {
      text-align: center;
      white-space: nowrap;

      i {
        padding: 2px;
        width: 24px;
        height: 24px;
        display: inline-block;
        font-style: normal;
        font-size: 10px;
        line-height: 24px;
        border-radius: 50%;
        color: #fff;
        border: 1px solid #fff;
        background: rgba(0, 0, 0, 0.2);
        margin: 10px;
        vertical-align: middle;
      }
    }

    .action-type {
      white-space: nowrap;
    }

    .action-btn {
      border-radius: 50%;
      width: 40px;
      height: 40px;
      padding: 2px;
      text-align: center;
      margin: 0 10px;
      line-height: 40px;
      border: 1px solid #fff;
      font-size: 14px;
      display: inline-block;
    }

    .action-btn--allin {
      border: thick double red;
      color: red;
      font-weight: bold;
    }
  }

  .action-other-size {
    background-color: rgba(0, 0, 0, 0);
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 90;

    .shadow {
      position: absolute;
      width: 100%;
      height: 100%;
      z-index: 8;
      overflow: hidden;
      background: linear-gradient(-70deg, black, transparent);
    }

    .action-other-size-body {
      z-index: 9;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(0, -50%);
      text-align: center;

      .size {
        input {
          background: transparent;
          font-size: 20px;
          width: 50px;
          text-align: center;
          color: #fff;
        }
      }

      .btn {
        display: inline-block;
        color: white;
        margin-top: 220px;
        border: 1px solid #fff;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.4);
        padding: 5px;
        font-size: 30px;
        width: 50px;
        height: 50px;
        line-height: 50px;
      }
    }
  }
}
</style>
