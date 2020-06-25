<template>
  <div class="home-container container">
    <div class="room-btn"
         v-show="showBtn">
      <div class="input-bd">
        <div class="input-name">smallBlind:</div>
        <div class="input-text">
          <input type="tel"
                 v-model="smallBlind"/>
        </div>
      </div>
      <div class="input-bd">
        <div class="input-name">isShort:</div>
        <div class="input-text">
          <input type="checkbox"
                 v-model="isShort"/>
        </div>
      </div>
      <div class="create-room btn"
           @click="createRoom"><span>create room</span>
      </div>
      <div class="btn"
           @click="joinRoom"><span>join room</span>
      </div>
      <div class="btn"
           @click="getRecord"><span>test record</span>
      </div>
    </div>
    <div class="room-number"
         v-show="isJoin">
      <div class="room-input inline">
        <div class="input-bd"
             :class="{error: isError}">
          <div class="input-name iconfont icon-password"></div>
          <div class="input-text">
            <input type="tel"
                   maxlength="6"
                   @focus="isError = false"
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
  import cookie from 'js-cookie';

  @Component
  export default class Home extends Vue {
    public roomNumber: string = '';
    private isJoin = false;
    private showBtn = true;
    private isError = false;
    private isShort = false;
    private smallBlind = 1;

    private async createRoom() {
      try {
        const result = await service.createRoom(this.isShort, this.smallBlind, 0);
        const { roomNumber } = result.data;
        const roomConfig = {
          isShort: this.isShort,
          smallBlind: this.smallBlind,
        }
        cookie.set('roomConfig', roomConfig, {expires: 1});
        this.$router.push({ name: 'game', params: { roomNumber, isOwner: '1' } });
      } catch (e) {
        console.log(e);
      }
    }

    private joinRoom() {
      this.isJoin = true;
      this.showBtn = false;
    }

    private async go() {
      if (!/^\d+$/.test(this.roomNumber)) {
        this.isError = true;
        return;
      }
      try {
        const { data } = await service.findRoom(this.roomNumber);
        if (data) {
          const roomConfig ={
            ...data
          }
          cookie.set('roomConfig', roomConfig, {expires: 1});
          this.$router.push({ name: 'game', params: { roomNumber: this.roomNumber } });
        } else {
          this.$plugin.toast('can\'t find the room');
          console.log('can\'t find the room');
        }
      } catch (e) {
        this.$plugin.toast('can\'t find the room');
      }
    }

    private async getRecord() {
      try {
        const { data } = await service.recordList('170432');
        console.log(data);
      } catch (e) {
        this.$plugin.toast('can\'t find the room');
      }
    }
  }
</script>
<style lang="less"
       scoped>
  .home-container {
    height: 100vh;
    display: flex;
    flex-direction: row;
    align-items: center;

    .room-btn {
      flex: 1;

      .btn {
        width: 50vw;
        margin: 30px auto;
      }
    }

    .room-number {
      line-height: 40px;
      text-align: center;
      width: 100%;

      .input-bd {
        border: 1px solid #bababa;
        border-radius: 4px;

        input {
          border-radius: 8px;
        }
      }

      .error {
        border: 1px solid #e8050a;
      }

      .room-btn {
        height: 30px;
        margin-top: 0;

        span {
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

      .inline {
        display: inline-block;
        vertical-align: middle;
      }
    }
  }
</style>
