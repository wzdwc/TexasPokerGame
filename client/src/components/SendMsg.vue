<template>
  <div class="send-msg-container">
    <msgList :msgList ='msgList' :show="showMsgList"></msgList>
    <div class="send-msg-body">
      <div class="msg-name iconfont icon-msg" @click="showMsgList = !showMsgList"></div>
      <div class="msg-input">
        <input type="text"
               @keyup.13="send"
               v-model='msg'>
      </div>
      <div class="msg-btn btn"
           @click="send" ><span>send</span></div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
  import msgList from '@/components/msgList.vue';

  @Component({
    components: {
      msgList,
    },
  })
  export default class SendMsg extends Vue {
    private msg: string = '';
    private showMsgList: boolean = false;
    @Prop({ type: Number, default: 1000 }) private max!: number;
    @Prop() private msgList!: string[];

    private send() {
      if (this.msg !== '') {
        this.$emit('send', this.msg);
        this.msg = '';
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped
       lang="less">
  .send-msg-container {
    position: fixed;
    .send-msg-body {
      position: fixed;
      width: 100vw;
      height: 25px;
      padding: 10px 0;
      left: 0;
      bottom: 0;
      background-color: #fff;
      font-size: 12px;
      display: flex;
      align-items: center;

      .msg-name {
        width: 40px;
        font-size: 30px;
        color: #009870;
        text-align: center;
      }

      .msg-input {
        flex: 1;
        border: 1px solid #bababa;
        text-align: left;

        input {
          height: 20px;
          width: 90%;
          padding: 0 5px;
          font-size: 12px;
        }
      }

      .msg-btn {
        width: 80px;
        margin-top: 0;
        margin-left: 0;
        text-align: center;

        span {
          padding: 5px 10px;
        }
      }
    }
  }
</style>
