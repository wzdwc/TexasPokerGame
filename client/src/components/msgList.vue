<template>
  <div class="list-container" v-show="show">
    <ul>
      <li v-for="msg in msgList">{{ msg.message }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';

@Component
export default class MsgList extends Vue {
  @Prop() private msgList!: string[];
  @Prop({ type: Boolean, default: false }) private show!: boolean;
}
</script>
<style lang="less" rel="stylesheet/less">
.list-container {
  background: #f5f5f5;
  position: absolute;
  bottom: 45px;
  padding: 10px 0;
  ul {
    height: 100px;
    width: 100vw;
    box-sizing: border-box;
    overflow-y: auto;
    padding: 0 12px;
    li {
      list-style: none;
      line-height: 20px;
      text-align: left;
      font-size: 12px;
      color: #2f2f2f;
    }
  }
}
</style>
