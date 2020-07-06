<template>
  <div class="sit-container">
    <div class="sit-player"
         v-if="player" :class="{ small: isSmall }">
      <div class="player"
           :class="{fold: player.status === -1}">
        <div class="user-name"
             v-show="player.nickName">
          {{ player.nickName }}
        </div>
        <div class="icon iconfont icon-user-avatar"></div>
        <div class="counter"
             v-show="player.counter || player.command === 'allin'">
          {{ player.counter }}
        </div>
        <div class="action-size"
             v-show="player.actionSize > 0">
          {{ player.actionSize }}
        </div>
        <div class="action-command"
             v-show="player.command">
          {{ player.command }}
        </div>
        <div class="type"
             v-show="player.type">
          {{ player.type }}
        </div>
        <div class="hand-card"
             v-show="player.handCard !== ''">

          <cardList :cardList="player.handCard.split(',')"></cardList>
        </div>
        <div class="card-style"
             v-show="player.handCard !== '' && player.commonCard !== ''">
          {{PokeStyle(player.handCard, player.commonCard)}}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import cardList from './cardList.vue'
import { PokerStyle } from '@/utils/PokerStyle';

@Component({
  components: {
    cardList,
  },
})
export default class Player extends Vue {
  @Prop() private player!: any;
  @Prop() private isSmall!: boolean;

  private PokeStyle(cards: string, commonCard: string) {
    if (commonCard === '' || cards === '') {
      return '';
    }
    const commonCardArr = commonCard.split(',');
    const cardsArr = cards.split(',');
    const card = [...cardsArr, ...commonCardArr];
    const style = new PokerStyle(card);
    return style.getPokerStyleName();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  .sit-container {
    .small{
      transform: scale(0.9);
    }
    .player {
      position: relative;
      font-size: 14px;
      width: 50 / 3.75vw;
      .icon {
        width: 45 / 3.75vw;
        height: 45 / 3.75vw;
        font-size: 45px;
        line-height: 45 / 3.75vw;
        border-radius: 50%;
        margin-bottom: 2px;
      }

      .user-name {
        color: #fff;
      }

      .count-down {
        height: 7vh;
        line-height: 9vh;
        width: 12vw;
        position: absolute;
        left: 0;
        top: 14px;
        color: #fff;
        font-weight: 700;
        font-size: 20px;
        background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.3), transparent);
      }

      .counter {
        background-color: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-weight: 600;
        font-size: 12px;
        border-radius: 2px;

        &.isAction {
          box-shadow: 0px 0px 6px 4px;
        }

        &.close-time-out {
          animation: 300ms timeOut infinite;
        }
      }

      .action-command {
        top: 15 / 6.67vh;
        left: 45 / 3.75vw;
        padding: 1px 8px;
        border-radius: 9px;
        color: #ffffff;
        background-color: #2c3e50;
        text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.3);
        position: absolute;
      }

      .card-style {
        color: #fff;
      }

      .type {
        background-color: #fff;
        color: #2b2b2b;
        border-radius: 50%;
        padding: 2px;
        width: 15 / 3.75vw;
        height: 15px;
        line-height: 16px;
        position: absolute;
        top: 53 / 6.67vh;
        left: 38 / 3.75vw;
        font-size: 12px;
        transform: scale(0.8);
      }

      .action-size {
        background: rgba(0, 0, 0, 0.3) url("../assets/gold.svg") center left no-repeat;
        background-size: contain;
        border-radius: 2px;
        padding: 1px 4px 1px 12px;
        text-align: center;
        min-width: 35 / 3.75vw;
        color: #fff;
        font-weight: 600;
        position: absolute;
        top: 35 / 6.67vh;
        left: 40 / 3.75vw;
      }

      &.fold {
        opacity: 0.4;
      }
      .hand-card{
        position: absolute;
        left: 0;
        top: 2vh;
        transform: scale(0.7);
      }
    }
  }
</style>
