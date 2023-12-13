<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';

export default class App extends Vue {}
</script>

<style lang="less">
@import 'assets/less/base';
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  max-width: 640rem;
  overflow: hidden;
  margin: auto;
}
* {
  padding: 0;
  margin: 0;
}
body {
  box-sizing: border-box;
}

.container {
  .input-bd {
    line-height: 30px;
    margin: 10px;
    font-size: 0;
    .input-name {
      display: inline-block;
      min-width: 10vw;
      font-size: 14px;
      vertical-align: middle;
    }
    .input-text {
      display: inline-block;
      font-size: 14px;
      vertical-align: middle;
      input {
        min-height: 30px;
        min-width: 40vw;
      }
    }
  }
  .btn {
    margin-top: 15px;
    span {
      color: #fff;
      background-color: #00976e;
      border-radius: 8px;
      padding: 5px 20px;
      display: block;
      margin: 10px;
    }
    b {
      display: inline-block;
      border: aliceblue;
      font-size: 12px;
      border-radius: 8px;
      padding: 5px 20px;
      margin-left: 10px;
    }
  }
}
</style>
