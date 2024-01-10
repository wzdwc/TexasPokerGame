<template>
  <div class="sit-list-container" ref="container">
    <div class="indicator" :style="indicatorStyle" v-if="actionUserId"></div>
    <div class="sit-list">
      <div class="sit" v-for="(sit, key) in sitList" :key="key" @click="sitDown(sit)">
        <div class="default" v-show="!sit.player">
          <i>sit</i>
        </div>
        <div class="sit-player" v-if="sit.player">
          <div class="player" :class="{ fold: sit.player.status === -1 }" :data-player-id="sit.player.userId">
            <div class="count-down" v-show="actionUserId === sit.player.userId">{{ time }}</div>
            <div class="user-name" v-show="sit.player.nickName">
              {{ sit.player.nickName }}
            </div>
            <div class="icon iconfont icon-user-avatar"></div>
            <span
              v-show="playersStatus[sit.player.userId] && playersStatus[sit.player.userId].speaking"
              class="speaking-icon"
              >🎙️</span
            >
            <div
              class="counter"
              :class="{
                isAction: actionUserId === sit.player.userId,
                'close-time-out': time > 0 && time < 10 && actionUserId === sit.player.userId,
              }"
              v-show="sit.player.counter >= 0 || sit.player.actionCommand === 'allin'"
            >
              {{ sit.player.counter || 0 }}
            </div>
            <div class="action-size" v-show="sit.player.actionSize > 0">
              {{ sit.player.actionSize }}
            </div>
            <div class="action-command" v-show="sit.player.actionCommand">
              {{ sit.player.actionCommand }}
            </div>
            <div class="type" v-show="sit.player.type">
              {{ sit.player.type }}
            </div>
            <div
              class="hand-card"
              v-show="
                !!!currPlayer ||
                  (sit.player.userId !== currPlayer.userId && sit.player.handCard && sit.player.handCard.length !== 0)
              "
            >
              <cardList :cardList="sit.player.handCard" :valueCards="valueCards"></cardList>
            </div>
            <div
              class="card-style"
              v-show="
                !!!currPlayer ||
                  (sit.player.userId !== currPlayer.userId && sit.player.handCard && sit.player.handCard.length !== 0)
              "
            >
              {{ PokeStyle(sit.player.handCard) }}
            </div>
          </div>
          <div class="cards" v-show="showHandCard(sit)">
            <div class="hand-card">
              <cardList :cardList="handCard" :valueCards="valueCards"></cardList>
              <div
                class="delay-time"
                v-show="time < 15 && sit.player.delayCount > 0 && actionUserId === sit.player.userId"
                @click="delayTime"
              >
                <i class="iconfont icon-clock "></i>
                <span>{{ sit.player.delayCount }}</span>
              </div>
            </div>
            <div class="ready" v-show="handCard && handCard.length === 0">ready</div>
            <div class="card-style" v-if="commonCard && commonCard.length > 0">{{ PokeStyle() }}</div>
          </div>
          <div class="win" v-show="sit.player.income">
            <!--            <span>win!</span>-->
            <span>{{ `+${sit.player.income}` }}</span>
          </div>
        </div>
      </div>
    </div>
    <BuyIn :showBuyIn.sync="showBuyIn" :min="0" :max="roomConfig.smallBlind * 200" @buyIn="buyIn"></BuyIn>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { IPlayer } from '@/interface/IPlayer';
import { IPlayersStatus } from '@/interface/IPlayersStatus';
import { ILinkNode } from '@/utils/Link';
import ISit from '@/interface/ISit';
import cardList from './CardList.vue';
import BuyIn from '@/components/BuyIn.vue';
import { PokerStyle } from '@/utils/PokerStyle';
import map from '../utils/map';
import { IRoom } from '@/interface/IRoom';

@Component({
  components: {
    cardList,
    BuyIn,
  },
})
export default class SitList extends Vue {
  @Prop() private msg!: string;
  @Prop() private currPlayer!: IPlayer;
  @Prop() private commonCard!: string[];
  @Prop() private sitLink!: ILinkNode<ISit>;
  @Prop() private handCard!: string[];
  @Prop() private winner!: IPlayer[][];
  @Prop() private isPlay!: boolean;
  @Prop() private roomConfig!: IRoom;
  @Prop() private actionUserId!: string;
  @Prop() private valueCards!: string;
  @Prop({ default: 30, type: Number }) private time!: number;
  @Prop() private playersStatus!: IPlayersStatus;

  private sitLinkNode: any = '';
  private showBuyIn = false;
  private currSit!: ISit;

  @Watch('sitLink')
  private getSit(val: ILinkNode<ISit>) {
    this.sitLinkNode = val;
  }

  private buyIn(size: number) {
    this.showBuyIn = false;
    this.currPlayer.counter += Number(size);
    this.$emit('buyIn', Number(size));
    this.sitDown(this.currSit);
  }

  private showHandCard(sit: ISit) {
    return sit.player?.userId === this.currPlayer?.userId;
  }

  private PokeStyle(cards: string[]) {
    if (this.commonCard.length === 0) {
      return '';
    }
    const commonCard = this.commonCard || [];
    let handCard = this.handCard || [];
    if (cards) {
      handCard = cards;
    }
    const card = [...handCard, ...commonCard];
    const style = new PokerStyle(card, this.roomConfig.isShort);
    return style.getPokerStyleName();
  }

  get handCardString() {
    return this.mapCard(this.handCard);
  }

  get hasSit() {
    return !!this.sitList.find((s) => s.player && s.player.userId === this.currPlayer?.userId);
  }

  get indicatorStyle() {
    const { actionUserId, sitLink } = this;

    if (actionUserId && sitLink) {
      const computeIndicatorStyle = (targetEl: HTMLDivElement, containerEl: HTMLDivElement) => {
        if (targetEl) {
          const { left, top, width, height } = targetEl.getBoundingClientRect();
          const containerRect = containerEl.getBoundingClientRect();
          const targetX = left + width / 2;
          const targetY = top + height / 2;
          const centerX = containerRect.left + containerRect.width / 2;
          const centerY = containerRect.top + containerRect.height / 2;
          const indicatorWidth = Math.sqrt(Math.abs(targetX - centerX) ** 2 + Math.abs(targetY - centerY) ** 2);
          let degree = (Math.asin(Math.abs(targetY - centerY) / indicatorWidth) * 180) / Math.PI;

          if (targetX >= centerX && targetY < centerY) {
            degree = 360 - degree;
          } else if (targetX < centerX && targetY < centerY) {
            degree += 180;
          } else if (targetX < centerX && targetY >= centerY) {
            degree = 180 - degree;
          }

          return {
            width: indicatorWidth + 'px',
            transform: `rotate3D(0, 0, 1, ${degree}deg)`,
          };
        }
      };

      const containerElement = this.$refs.container as HTMLDivElement;
      const playerElement = containerElement?.querySelector<HTMLDivElement>(`[data-player-id="${actionUserId}"]`);

      if (playerElement) {
        return computeIndicatorStyle(playerElement, containerElement);
      }
    }

    return null;
  }

  private mapCard(cards: string[]) {
    return map(cards);
  }

  private delayTime() {
    if (this.currPlayer.delayCount > 0) {
      // this.$emit('update:time', this.time  + 60);
      this.$emit('delay');
    }
  }

  private sitDown(sit: ISit) {
    if (!sit.player && (!this.isPlay || !this.hasSit)) {
      if (this.currPlayer.counter <= 0) {
        this.showBuyIn = true;
        this.currSit = sit;
        return;
      }
      let sitNode = this.sitLinkNode;
      for (let i = 0; i < 9; i++) {
        if (sitNode) {
          const next = sitNode.next;
          if (sitNode.node.player?.nickName === this.currPlayer?.nickName) {
            delete sitNode.node.player;
          }
          sitNode = next as ILinkNode<ISit>;
        }
      }
      for (let i = 0; i < 9; i++) {
        if (sitNode) {
          const next = sitNode.next;
          if (sit.position === sitNode.node.position) {
            sitNode.node.player = this.currPlayer as IPlayer;
            this.$emit('update:sitLink', sitNode);
            this.$emit('sit', sitNode);
            break;
          }
          sitNode = next as ILinkNode<ISit>;
        }
      }
    }
  }

  get sitList() {
    const sitMap: ISit[] = [];
    if (this.sitLinkNode) {
      let link = this.sitLinkNode;
      for (let i = 0; i < 9; i++) {
        if (link.node.player && link.node.player.userId === this.currPlayer?.userId) {
          this.sitLinkNode = link;
          break;
        }
        const next = link.next;
        link = next as ILinkNode<ISit>;
      }
      let sitNode = this.sitLinkNode;
      for (let i = 0; i < 9; i++) {
        const next = sitNode.next;
        sitMap.push(sitNode.node);
        sitNode = next as ILinkNode<ISit>;
      }
      console.log('sit', sitMap);
      return sitMap;
    }
    return [];
  }

  private mounted() {
    this.sitLinkNode = this.sitLink;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.sit-list-container {
  position: relative;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  height: 100%;
  width: 100vw;

  .indicator {
    position: absolute;
    left: 50%;
    top: 50%;
    height: 180px;
    margin-top: -90px;
    background-image: linear-gradient(90deg, transparent 5%, rgba(255, 255, 255, 0.2) 75%, transparent);
    clip-path: polygon(0 50%, 100% 0, 100% 100%, 0 50%);
    transform-origin: left center;
    pointer-events: none;

    @media (max-height: 680px) {
      height: 100px;
      margin-top: -50px;
    }
  }

  .sit-list {
    position: relative;
    width: 100vw;
    height: 100%;
    max-width: 800px;
    max-height: 800px;
    padding: 10px;
    margin: auto;
    box-sizing: border-box;

    .sit {
      position: absolute;
      font-size: 12px;
      z-index: 1;

      @media (min-width: 800px) and (min-height: 800px) {
        transform: scale(1.25);
        transform-origin: left bottom;
      }

      .default {
        i {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid #bababa;
          display: block;
          font-style: normal;
          font-size: 20px;
          line-height: 48px;
          color: #fff;
        }
      }

      .player {
        width: 48px;
        position: relative;

        .icon {
          width: 48px;
          height: 48px;
          font-size: 45px;
          line-height: 48px;
          border-radius: 50%;
          margin-bottom: 2px;
        }

        .speaking-icon {
          font-size: 18px;
          position: absolute;
          top: 45px;
          left: 0;
        }

        .user-name {
          color: #fff;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-shadow: 1px 1px 2px black;
        }

        .count-down {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          position: absolute;
          left: 0;
          top: 18px;
          bottom: 18px;
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
          top: 14px;
          left: calc(100% - 3px);
          padding: 1px 8px;
          border-radius: 9px;
          color: #ffffff;
          background-color: #2c3e50;
          text-shadow: 1px 2px 3px rgba(0, 0, 0, 0.3);
          position: absolute;
        }

        .card-style {
          color: #fff;
          margin-top: 4px;
        }

        .type {
          background-color: #fff;
          color: #2b2b2b;
          border-radius: 50%;
          padding: 2px;
          width: 15px;
          height: 15px;
          line-height: 16px;
          position: absolute;
          left: 100%;
          top: 66px;
          font-size: 12px;
          transform: scale(0.8);
        }

        .action-size {
          background: rgba(0, 0, 0, 0.3) url('../assets/gold.svg') center left no-repeat;
          background-size: contain;
          border-radius: 2px;
          padding: 1px 4px 1px 17px;
          text-align: center;
          color: #fff;
          font-weight: 600;
          position: absolute;
          left: 100%;
          top: 40px;
          min-width: 30px;
          box-sizing: border-box;
        }

        &.fold {
          opacity: 0.4;
        }
      }

      .delay-time {
        position: absolute;
        top: 0;
        left: 120px;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
        background: radial-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0) 70%);
        i {
          color: #fff;
          font-size: 50px;
        }
        span {
          font-size: 25px;
          color: #fff;
          margin-left: 2px;
          font-weight: 600;
        }
      }

      .hand-card {
        position: absolute;
        left: 0;
        top: 18px;
      }

      &:nth-child(1) {
        left: 50%;
        top: 80%;
        margin-left: -90px;

        .action-command {
          left: unset;
          right: calc(100% - 3px);
        }

        .type {
          left: unset;
          right: 100%;
        }

        .action-size {
          top: 0;
          left: calc(100% + 20px);
          min-width: 84px;
          padding-right: 17px;
          text-align: center;
        }
      }

      &:nth-child(2) {
        left: 10px;
        top: 60%;
      }

      &:nth-child(3) {
        left: 10px;
        top: 40%;
      }

      &:nth-child(4) {
        left: 10px;
        top: 20%;
      }

      &:nth-child(5) {
        left: 25%;
        top: 20px;
      }

      &:nth-child(6) {
        right: 25%;
        top: 20px;
      }

      &:nth-child(7) {
        right: 10px;
        top: 20%;
      }

      &:nth-child(8) {
        right: 10px;
        top: 40%;
      }

      &:nth-child(9) {
        right: 10px;
        top: 60%;
      }

      &:nth-child(6),
      &:nth-child(7),
      &:nth-child(8),
      &:nth-child(9) {
        .action-command {
          left: unset;
          right: calc(100% - 3px);
        }

        .type {
          left: unset;
          right: 100%;
        }

        .action-size {
          background-position: right;
          left: unset;
          right: 100%;
          padding-left: 1px;
          padding-right: 17px;
          text-align: right;
        }

        .hand-card {
          left: unset;
          right: 0;
        }
        .card-style {
          min-width: 100%;
          float: right;
        }
      }

      .cards {
        position: absolute;
        left: calc(100% + 20px);
        top: 5px;

        .ready {
          font-size: 14px;
          display: inline-block;
          vertical-align: middle;
        }

        .card-style {
          position: absolute;
          color: #fff;
          font-size: 14px;
          line-height: 1;
          top: 84px;
          text-align: center;
          font-weight: 700;
        }
      }

      .win {
        position: absolute;
        z-index: 8;
        left: 0;
        top: 4vh;
        font-size: 20px;
        color: rgba(255, 209, 0, 0.99);
        font-weight: 600;
        animation: fadeOut 4s forwards;
        background-image: linear-gradient(to top, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));
      }
    }
  }

  @-webkit-keyframes fadeOut /* Safari 与 Chrome */ {
    0% {
      transform: translate3d(2px, 0, 0);
      opacity: 1;
    }
    30% {
      transform: translate3d(2px, 0, 0);
      opacity: 1;
    }
    to {
      transform: translate3d(2px, -15px, 0);
      opacity: 0;
    }
  }
  @-webkit-keyframes timeOut /* Safari 与 Chrome */ {
    0% {
      box-shadow: none;
    }
    100% {
      box-shadow: 0px 0px 6px 4px;
    }
  }
}
</style>
