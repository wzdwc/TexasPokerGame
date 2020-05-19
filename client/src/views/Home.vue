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
    <div class="room number" v-show="isJoin">
      <div class="input-bd">
        <div class="input-name">room number:</div>
        <div class="input-text">
          <input type="tel" maxlength="6"
                 v-model="roomNumber"/>
        </div>
      </div>
      <div class="btn">
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
      this.$router.replace({ name: 'game', params: { roomNumber: this.roomNumber } });
    }
  }
</script>
<style lang="less">
  .home-container {

  }
</style>
