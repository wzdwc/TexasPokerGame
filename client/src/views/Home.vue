<template>
  <div class="home-container container">
    <div class="room-btn" v-show="showBtn">
      <div class="create-room btn"
           @click="createRoom"><span>create room</span>
      </div>
      <div class="btn"
           @click="joinRoom"> <span>join room</span>
      </div>
    </div>
    <div class="room-number" v-show="isJoin">
      <div class="room-input inline">
        <div class="input-bd">
          <div class="input-name iconfont icon-password"></div>
          <div class="input-text">
            <input type="tel" maxlength="6"
                   v-model="roomNumber"/>
          </div>
        </div>
      </div>
      <div class="room-btn inline">
        <span @click="go">go</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Vue } from 'vue-property-decorator';
  import Component from 'vue-class-component';
  import service from '../service';
  @Component
  export default class Home extends Vue {
    public roomNumber: string = '';
    private isJoin = false;
    private showBtn = true;

    private async createRoom() {
      try {
        const result = await service.createRoom();
        const { roomNumber } = result.data;
        console.log(result);
        this.$router.replace({ name: 'game', params: { roomNumber, isOwner: '1' } });
      } catch (e) {
        console.log(e);
      }
    }

    private joinRoom() {
      this.isJoin = true;
      this.showBtn = false;
    }

    private go() {
      if (/^\d+$/.test(this.roomNumber)) {
        this.$router.replace({ name: 'game', params: { roomNumber: this.roomNumber } });
      }
    }
  }
</script>
<style lang="less" scoped>
  .home-container {
    height: 100vh;
    display: flex;
    flex-direction: row;
    align-items: center;
    .room-btn{
      flex: 1;
      .btn{
        width: 50vw;
        margin:30px auto;
      }
    }
    .room-number{
      line-height: 40px;
      text-align: center;
      width: 100%;
      .input-bd{
        border: 1px solid #bababa;
        border-radius: 4px;
        input{
          border-radius: 8px;
        }
      }
      .room-btn{
        height: 30px;
        margin-top: 0;
        span{
          margin: 0;
          line-height: 30px;
          height: 30px;
          font-size: 12px;
          color: #fff;
          background-color: #00976e;
          border-radius: 8px;
          padding: 0 20px;
          display: block;
        }
      }
      .inline{
        display: inline-block;
        vertical-align: middle;
      }
    }
  }
</style>
