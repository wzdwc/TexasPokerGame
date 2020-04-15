<template>
  <div class="home">
    <div class="create-room" @creatRoom = 'createRoom'>create room</div>
    <div class="join room" @joinRoom = 'joinRoom'>join room</div>
    <div class="room number">room number: </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  export default class Login extends Vue {
    roomNumber: string = '';
    createRoom() {}
    joinRoom() {}
  }
</script>
