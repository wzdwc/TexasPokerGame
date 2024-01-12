<template>
  <div class="notice-container">
    <div class="notice-body">
      <i v-for="message in messageList" v-if="message !== ''" :style="{ top: `${message.top}vh`, animationDuration: `${duration}s` }">{{
        message.message
      }}</i>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';

@Component
export default class Notice extends Vue {
  @Prop() private messageList!: any[];
  private duration = 8;

  private resetDuration() {
    const pageWidth = document.documentElement.clientWidth;
    this.duration = pageWidth > 800
      ? Math.round(pageWidth / 375 * 4)
      : Math.round(pageWidth / 375 * 8);
  }

  private mounted() {
    this.resetDuration();
    window.addEventListener('resize', this.resetDuration);
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.resetDuration);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.notice-container {
  .notice-body {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    z-index: 999;
    pointer-events: none;
    i {
      position: absolute;
      top: 20px;
      left: 0;
      transform: translate3d(100vw, 0, 0);
      animation: 8s move linear forwards;
      color: #fff;
      padding: 4px;
      font-size: 12px;
      font-style: normal;
      border-radius: 2px;
      background-color: rgba(0, 0, 0, 0.4);

      @media (min-width: 800px) {
        border-radius: 4px;
        font-size: 16px;
      }
    }
  }
  @-webkit-keyframes move /* Safari 与 Chrome */ {
    0% {
      transform: translate3d(100vw, 0, 0);
    }
    99% {
      transform: translate3d(-198px, 0px, 0px);
      opacity: 1;
    }
    100% {
      transform: translate3d(-200px, 0px, 0px);
      opacity: 0;
    }
  }
}
</style>
