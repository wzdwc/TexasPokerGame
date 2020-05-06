<template>
  <div class="sit-list-container">
    <div class="sit-list">
      <div class="item" v-for="(sit,key) in sitList" :key="key" @click="sitDown(key)">
        <div class="default"></div>
        <div class="player">
          <div class="user-name">test</div>
          <div class="icon"></div>
          <div class="counter">100</div>
          <div class="action-size">200</div>
          <div class="action-command">call</div>
          <div class="type">bb</div>
          <div class="hand-card"></div>
        </div>
        <div class="cards">
          <div class="hand-card"></div>
          <div class="card-style"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import {IUser} from '../../../server/src/interface/IUser';

  interface ISit {
    player?: IUser;
    position: number;
  }

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
  .sit-list-container {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    height: 100vh;
    width: 100vw;
    .sit-list {
      position: relative;
      width: 100vw;
      height: 620px;
      padding: 10px;
      margin:0 15px;
      box-sizing: border-box;
      .item {
        position: absolute;
        font-size: 12px;
        .player{
          position: relative;
          .icon{
            width: 45px;
            height: 45px;
            background: url("../assets/poke-icon.png") #fff;
            background-size: 100% 100%;
            border-radius: 2px;
            border: 1px solid #bababa;
            margin-bottom: 2px;
          }
          .user-name{
            color: #fff;
          }
          .counter{
            background-color: rgba(0,0,0,0.8);
            color: #fff;
            font-weight: 600;
            font-size: 12px;
            border-radius: 2px;
          }
          .action-command{
            top: 15px;
            left: 45px;
            padding: 1px 8px;
            border-radius: 9px;
            color: #ffffff;
            background-color: #2c3e50;
            text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.3);
            position: absolute;
          }
          .type{
            background-color: #fff;
            color: #2b2b2b;
            border-radius: 50%;
            padding: 2px;
            width: 18px;
            height: 18px;
            line-height: 18px;
            position: absolute;
            top: 53px;
            left: 38px;
            font-size: 12px;
            transform: scale(0.8);
          }
          .action-size{
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 2px;
            padding:1px 4px;
            text-align: center;
            min-width: 35px;
            color: #fff;
            font-weight: 600;
            position: absolute;
            top: 35px;
            left: 40px;
          }
        }
        &:nth-child(1) {
          left: 75px;
          top: 0;
        }

        &:nth-child(2) {
          left: 240px;
          top: 0;
        }

        &:nth-child(3) {
          left: 296px;
          top: 100px;
        }

        &:nth-child(4) {
          left: 296px;
          top: 200px;
        }

        &:nth-child(5) {
          left: 296px;
          top: 330px;
        }

        &:nth-child(6) {
          left: 100px;
          top: 460px;
          .action-command{
            left: -22px;
          }
          .type{
            left: -16px;
          }
          .action-size{
            top: -5px;
            left: 57px;
            padding-right: 15px;
            text-align: right;
          }
        }

        &:nth-child(7) {
          left: 0;
          top: 330px;
        }

        &:nth-child(8) {
          left: 0;
          top: 200px;
        }

        &:nth-child(9) {
          left: 0;
          top: 100px;
        }
        &:nth-child(2),&:nth-child(3),&:nth-child(4),&:nth-child(5){
          .action-command{
            left: -22px;
          }
          .type{
            left: -16px;
          }
          .action-size{
            left: -40px;
            padding-right: 15px;
            text-align: right;
          }
        }
      }
    }
  }
</style>
