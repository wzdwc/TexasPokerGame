<template>
  <div class="container">
    <div class="common-card-container">
      <div class="card" v-bind:class="{ show: show, turn: show}">
        <i></i>
        <span class="card-bg">
          A ♣
        </span>
      </div>
      <div class="card" v-bind:class="{ show: show, turn: show}">
        <i></i>
        <span class="card-bg">
          A ♣
        </span>
      </div>
      <div class="card" v-bind:class="{ show: show, turn: show}">
        <i></i>
        <span class="card-bg">
          A ♣
        </span>
      </div>
      <div class="card" v-bind:class="{ show: show}">
        <i></i>
        <span class="card-bg">
          A ♣
        </span>
      </div>
      <div class="card" v-bind:class="{ show: show}">
        <i></i>
        <span class="card-bg">
          A ♣
        </span>
      </div>
    </div>
    <div class="btn" @click="showCard"><span>翻转</span></div>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator';

  @Component
  export default class SitList extends Vue {
    private show = false
    private showCard() {
      this.show = true
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
    .card{
      height: 237/3.5px;
      width: 155/3.5px;
      position: absolute;
      top: 0;
      left: 0;
      transform-style: preserve-3d;
      transition: transform 1s, rotateY 1s linear 2s;
      opacity: 0;
      i{
        background: url("../assets/poke.png");
        height: 237/3.5px;
        width: 155/3.5px;
        background-size: 100% 100%;
        margin:0 2px;
        transform: rotateY(0deg)  translate3d(0px,0px,0px);
        backface-visibility: hidden;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
      }
      .card-bg{
        /*background: url("../assets/poke-icon.png");*/
        background-size: 100% 100%;
        height: 237/3.5px;
        width: 155/3.5px;
        margin:0 2px;
        background-color: #2c3e50;
        transform: rotateY(180deg) translate3d(0px,0px,2px);
        color: #fff;
        backface-visibility: hidden;
        position: absolute;
        left: 0;
        z-index: 0;
      }
      &.show{
        display: block;
        opacity: 1;
      }
      /*&.turn{*/
      /*  transform: rotateY(-180deg);*/
      /*}*/
      &:nth-child(1){
        &.show{
          transform: translate3d(0px,0px,2px)  rotateY(-180deg);
        }
      }
      &:nth-child(2){
        &.show{
          transform: translate3d(46px,0px,2px)  rotateY(-180deg);
        }
      }
      &:nth-child(3){
        &.show{
          transform: translate3d(46*2px,0px,2px)  rotateY(-180deg);
        }
      }
      &:nth-child(4){
        &.show{
          transform: translate3d(46*3px,0px,0px);
        }
      }
      &:nth-child(5){
        &.show{
          transform: translate3d(46*4px,0px,0px);
        }
      }
    }

    /*@-webkit-keyframes turnA !* Safari 与 Chrome *!*/
    /*{*/
    /*  from {transform: rotateY(0deg);}*/
    /*  to {transform: rotateY(-180deg);}*/
    /*}*/
  }
</style>
