<template>
  <div class="record-container" :class="{show:show}">
    <div class="shadow"
         @click="show = false"></div>
    <div class="body">
      <div class="title">record</div>
      <div class="record-context">
      <ul class = 'td'>
        <div class="lo">
          <span class="player">player</span>
          <i>commonCard</i>
          <span class="pot">pot</span>
        </div>
      </ul>
      <ul class="record-box">
        <li v-for="player in commandList">
          <div class="player">
            <Player :player="player" :is-small="true"></Player>
          </div>
          <div class="commandCard">
            <cardList :card-list="commonCardMap(player.commonCard)"
                      :value-cards="valueCard"
            ></cardList>
          </div>
          <div class="pot">
            <span>{{player.pot}}</span>
          </div>
        </li>
      </ul>
      <div class="record-btn">
        <i class="iconfont icon-arrow" :class="{ disable: currGameIndex === 1 }" @click="getRecord(-1)"></i>
        <span>{{currGameIndex}}</span>
        <i class="iconfont icon-arrow right" :class="{ disable: currGameIndex === maxIndex }" @click="getRecord(1)"></i>
      </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import { IPlayer } from '@/interface/IPlayer';
  import Player from './Player.vue';
  import CardList from '@/components/CardList.vue';
  import { IGameRecord } from '@/interface/IGameRecord';

  @Component({
    components: {
      CardList,
      Player,
    },
  })
  export default class Record extends Vue {
    @Prop() private value!: boolean;
    @Prop() private gameList!: IGameRecord [];
    @Prop() private commandList!: IPlayer[];
    @Prop() private currGameIndex!: number;

    private valueCard = [];

    get show() {
      return this.value;
    }
    set show(val) {
      this.$emit('input', val);
    }
    get maxIndex() {
      return this.gameList.length;
    }

    private getRecord(type: number) {
      const index = this.currGameIndex + type;
      if (index > this.maxIndex || index <= 0) {
        return;
      }
      this.$emit('getRecord', index);
    }
    private commonCardMap(commonCard: string) {
      const commonCardArr = commonCard.split(',');
      const arr = [];
      for (let i = 0; i < 5; i++) {
        if (commonCardArr[i]) {
          arr.push(commonCardArr[i]);
        } else {
          arr.push('');
        }
      }
      return arr;
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped
       lang="less">
  .record-container {
    position: absolute;
    right: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: none;
    &.show{
      display: block;
      .body{
        animation: 0.3s move forwards;
      }
    }
    .shadow {
      background: rgba(0, 0, 0, 0.3);
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      position: fixed;
      z-index: 1;
    }

    .body {
      width: 90vw;
      height: 100vh;
      color: #fff;
      background: #006a55;
      position: absolute;
      right: 0;
      top: 0;
      z-index: 9999;
      overflow: hidden;
      transform: translate3d(100vw, 0, 0);
      display: flex;
      flex-direction: column;
      .record-context{
        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex: 1;
        .record-box{
          flex: 1;
          overflow: auto;
        }
      }
    }

    .title {
      color: #fff;
      text-align: left;
      line-height: 30px;
      height: 30px;
      padding: 5px 10px;
      border-bottom: 1px solid #fff;
    }

    .td{
      height:30px;
    }

    ul {
      .pot{
        width: 10vw;
        font-size: 11px;
        line-height: 58px;
        span{
          display: inline-block;
          vertical-align: middle;
        }
      }
      .player{
        width: 16vw;
      }
      .lo {
        display: flex;
        i {
          flex: 1;
          padding: 5px 10px;
          line-height: 20px;
          display: inline-block;
          font-style: normal;
          font-size: 14px;
        }
        span {
          padding: 5px 10px;
          line-height: 20px;
          display: inline-block;
          font-style: normal;
          font-size: 14px;
        }
        .pot{
          line-height: 18px;
          font-size: 14px;
        }
      }
      li{
        padding: 0 6px;
        display: flex;
        height: 90px;
        .commandCard{
          flex: 1;
          position: relative;
          transform: scale(0.7);
        }
      }
    }
    .record-btn{
      height: 50px;
      width: 100%;
      line-height: 50px;
      i{
        transform: rotate(90deg);
        display: inline-block;
        vertical-align: middle;
        font-size: 40px;
        &.right{
          transform: rotate(270deg);
        }
        &.disable{
          opacity: .4;
        }
      }
      span{
        display: inline-block;
        vertical-align: middle;
      }
    }
    @-webkit-keyframes move /* Safari 与 Chrome */ {
      0% {
        transform: translate3d(100vw,0,0);
      }
      100% {
        transform: translate3d(0, 0px, 0px);
      }
    }
  }

</style>
