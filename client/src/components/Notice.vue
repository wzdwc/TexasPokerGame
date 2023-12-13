<template>
  <div class="notice-container">
    <div class="notice-body">
      <i v-for="message in messageList" v-if="message !== ''" :style="{ top: `${message.top}vh` }">{{
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
    i {
      position: absolute;
      top: 20px;
      left: 0;
      transform: translate3d(100vw, 0, 0);
      z-index: 10;
      animation: 8s move linear forwards;
      color: #fff;
      padding: 4px;
      font-size: 12px;
      font-style: normal;
      border-radius: 2px;
      background-color: rgba(0, 0, 0, 0.4);
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
