<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';

export default class App extends Vue {}
</script>

<style lang="less">
@import "assets/less/base";
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
  *{
    padding: 0;
    margin: 0;
  }
  body{
    box-sizing: border-box;
  }

.container{
  .input-bd{
    line-height: 30px;
    margin: 10px;
    .input-name{
      display: inline-block;
      width: 100px;
      text-align: right;
    }
    .input-text{
      display: inline-block;
      padding-left: 10px;
      input{
        height: 30px;
        width: 180px;
        padding:0 5px;
      }
    }
  }
  .btn {
    margin-top: 15px;
    span{
      color: #fff;
      background-color: #6796ff;
      border-radius: 8px;
      padding: 5px 20px;
      display: inline-block;
      margin: 10px;
    }
    b{
      display: inline-block;
      border: aliceblue;
      border-radius: 8px;
      padding: 5px 20px;
      margin-left: 10px;
    }
  }
}
</style>
