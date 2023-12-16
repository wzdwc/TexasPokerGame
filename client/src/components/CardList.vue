<template>
  <div class="card-container">
    <div class="card" v-for="(card, key) in cardList" v-bind:class="{ show: show, turn: show && card !== '' }">
      <i></i>
      <span class="card-bg red" :class="{ black: isBlack(map(card)[1]) }">
        <div class="shadow" v-show="shadow(card)"></div>
        <b class="number">{{ map(card)[0] }}</b>
        <b class="color">
          <cardStyle size="small" :type="map(card)[1]"></cardStyle>
        </b>
        <b class="color big">
          <cardStyle size="big" :type="map(card)[1]"></cardStyle>
        </b>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapCard } from '@/utils/map';
import cardStyle from '@/components/CardStyle.vue';

@Component({
  components: {
    cardStyle,
  },
})
export default class Card extends Vue {
  @Prop() private cardList: any;
  @Prop({ default: () => [], type: Array }) private valueCards!: string[];

  get show() {
    return this.cardList.length !== 0;
  }

  private isBlack(type: string) {
    return type === 's' || type === 'c';
  }

  private map(card: string) {
    return mapCard(card);
  }

  private shadow(card: string) {
    if (this.valueCards.length === 0 || card === '') {
      return false;
    }
    return this.valueCards.indexOf(card) < 0;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.card-container {
  display: inline-flex;
  gap: 4px;

  .card {
    position: relative;
    height: 60px;
    width: 40px;
    transform-style: preserve-3d;
    opacity: 0;
    border-radius: 5px;
    z-index: 0;

    i {
      background: url('../assets/poke.png');
      height: 60px;
      width: 40px;
      background-size: 100% 100%;
      transform: rotateY(0deg) translate3d(0px, 0px, 0px);
      backface-visibility: hidden;
      position: absolute;
      border-radius: 5px;
      top: 0;
      left: 0;
      z-index: 1;
    }

    .card-bg {
      /*background: url("../assets/poke-icon.png");*/
      background-size: 100% 100%;
      height: 60px;
      width: 40px;
      border-radius: 5px;
      background-color: #fff;
      transform: rotateY(180deg) translate3d(0px, 0px, 0px);
      backface-visibility: hidden;
      position: absolute;
      left: 0;
      z-index: 0;
      display: flex;
      flex-direction: column;
      transform-style: preserve-3d;
      box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);

      .shadow {
        width: 40px;
        height: 60px;
        left: 0;
        top: 0;
        border-radius: 5px;
        position: absolute;
        z-index: 1;
        background: rgba(0, 0, 0, 0.4);
      }

      &.red {
        color: #e8050a;
      }

      &.black {
        color: #000;
      }

      .number {
        text-align: left;
        position: absolute;
        left: 5px;
        font-size: 16px;
        line-height: 25px;
        font-family: initial;
      }

      .color {
        position: absolute;
        left: 5px;
        top: -2px;
        font-size: 20px;
        line-height: 60px;
        font-family: Arial;
        &.big {
          left: 15px;
          font-size: 35px;
          top: 12px;
        }
      }
    }

    &.show {
      display: block;
      opacity: 1;
      transition: left 1s;
    }

    &.turn {
      animation: turnA 1s forwards;
      animation-delay: 1s;
    }
  }

  @-webkit-keyframes turnA /* Safari 与 Chrome */ {
    from {
      transform: rotateY(0deg);
    }
    to {
      transform: rotateY(-180deg);
    }
  }
}
</style>
