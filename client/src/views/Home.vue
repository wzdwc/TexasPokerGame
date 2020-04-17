<template>
  <div class="home container">
    <div class="create-room"
         @click="createRoom">create room
    </div>
    <div class="join room"
         @click="joinRoom">join room
    </div>
    <div class="room number">room number:</div>
  </div>
</template>

<script lang="ts">
  import {Vue} from 'vue-property-decorator';
  import Component from 'vue-class-component';
  import service from '../service';

  @Component
  export default class Home extends Vue {
    public roomNumber: string = '';

    private async createRoom() {
      try {
        const result = await service.createRoom();
        const {roomNumber} = result.data;
        console.log(result);
        this.$router.replace({name: 'game', params: {roomNumber}});
      } catch (e) {
        console.log(e);
      }
    }

    private joinRoom() {
      console.log('');
    }
  }
</script>
<style lang="less">
  .container{
    .create-room{
      padding: 10px;
      background-color: #6796ff;
      color: #fff;
      border-radius: 8px;
      width: 100px;
      margin: auto;
    }
  }
</style>
