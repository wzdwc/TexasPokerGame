<template>
  <div class="common-card-container">
    <i></i>
    <i></i>
    <i></i>
    <i></i>
    <i></i>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';

  @Component
  export default class SitList extends Vue {
    @Prop() private msg!: string;
    @Prop() private currPlayer: any;
    private sitList: ISit[] = [];

    private sitDown(sit: ISit) {
      if (!sit.player) {
        sit.player = this.currPlayer;
      }
    }

    private mounted() {
      for (let i = 0; i < 9; i++) {
        const sit = {
          position: i + 1,
        };
        this.sitList.push(sit);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  .common-card-container{
    position: absolute;
    top: 50vh;
    left: 50%;
    margin: -35px -122px;
    i{
      background: url("../assets/poke.png");
      height: 237/3.5px;
      width: 155/3.5px;
      background-size: 100% 100%;
      display: inline-block;
      margin:0 2px;
    }
  }
</style>
