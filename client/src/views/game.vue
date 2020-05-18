<template>
  <div class="game-container container">
    <sitList :sitLink.sync='sitLink'
             :currPlayer="currPlayer"
             :commonCard="commonCard"
             @sit="sitDown"
             @buyIn="buyIn"
             :isPlay='isPlay'
             :valueCards = 'valueCards'
             :winner="winner"
             :actionUserId='actionUserId'
             :hand-card="handCard"></sitList>
    <common-card
      :commonCard="commonCard"
      :valueCards = 'valueCards'
    ></common-card>
    <div class="winner-poke-style"
         v-show="gameOver && winner[0][0].handCard.length > 0">
      {{PokeStyle(winner[0] && winner[0][0] && winner[0][0].handCard)}} WIN!!
    </div>
    <div class="game-body">
      <div class="pot">pot: {{pot}}</div>
      <div class="btn play"
           v-show="isOwner && !isPlay"><span @click="play">play game</span></div>
    </div>
    <div class="action"
         v-show="isAction">
      <div class="action-type action-btn">
          <span @click="action('check')"
                v-show="showActionBtn('check')">check</span>
        <span @click="action('fold')">fold</span>
        <span @click="action('call')"
              v-show="showActionBtn('call')">call</span>
        <span @click="otherSizeHandle()"
              v-show="showActionBtn('raise')">more</span>
        <span @click="action('allin')"
              v-show="!showActionBtn('raise')">allin</span>
      </div>
      <div class="raise-size">
        <div class="not-allin"
             v-show="showActionBtn('raise')">
          <i v-for="size in raiseSizeMap.firsAction"
             @click="raise(size)"
             v-show="commonCard.length === 0 && pot === 3">
            {{Math.floor(size * prevSize)}}
          </i>
          <i v-for="size in raiseSizeMap.other"
             @click="raise(size)"
             v-show="showActionSize(size)"
          > {{Math.floor(size * pot)}}</i>
          <!--          <i @click="raise(pot)">{{pot}}</i>-->
          <!--          <i @click="raise(pot * 2)">{{2*pot}}</i>-->
        </div>
      </div>
      <div class="action-other-size"
           v-if="isRaise">
        <div class="action-other-size-body">
          <div class="size"
               v-show="currPlayer && raiseSize < currPlayer.counter">{{raiseSize}}
          </div>
          <div class="size"
               v-show="currPlayer && raiseSize === currPlayer.counter">Allin
          </div>
          <range :max="currPlayer && currPlayer.counter"
                 :min="minActionSize"
                 :is-horizontal="true"
                 @change="getBuyInSize"></range>
          <div class="btn"
               @click="addSize">ok
          </div>
        </div>
        <div class="shadow"
             @click="isRaise = false"></div>
      </div>
    </div>
    <div class="setting">
      <div class="iconfont icon-setting setting-btn"
           @click="showSetting = true"></div>
      <div class="setting-body"
           :class="{show: showSetting}">
        <i @click="showBuyInDialog()">buy in</i>
        <i></i>
      </div>
    </div>
    <BuyIn :showBuyIn.sync='showBuyIn'
           :min='200'
           :max='1000'
           @buyIn='buyIn'></BuyIn>
    <toast :show="showMsg"
           :text="msg"></toast>
  </div>
</template>

<script lang="ts">
  import {Vue, Watch} from 'vue-property-decorator';
  import Component from 'vue-class-component';
  import io from 'socket.io-client';
  import cookie from 'js-cookie';
  import sitList from '../components/SitList.vue';
  import commonCard from '../components/CommonCard.vue';
  import {IPlayer} from '@/interface/IPlayer';
  import {ILinkNode, Link} from '@/utils/Link';
  import ISit from '../interface/ISit';
  import BuyIn from '../components/BuyIn.vue';
  import range from '../components/range.vue';
  import toast from '../components/toast.vue';
  import map from '../utils/map';
  import {PokerStyle} from '@/utils/PokerStyle';

  export enum ECommand {
    CALL = 'call',
    ALL_IN = 'allin',
    RAISE = 'raise',
    CHECK = 'check',
    FOLD = 'fold',
  }

  interface IMsg {
    action: string;
    clients: string[];
    target: string;
    data: any;
  }

  const GAME_BASE_SIZE = 1;

  @Component({
    components: {
      sitList,
      commonCard,
      BuyIn,
      range,
      toast,
    },
  })
  export default class Game extends Vue {
    public socket: any = null;
    // in the room user
    // have a sit user
    private players: IPlayer[] = [];
    private userInfo: any = {};
    private joinMsg = '';
    private handCard = [];
    private commonCard = [];
    private pot = 0;
    private prevSize = 0;
    private isAction = false;
    private isRaise = false;
    private winner: IPlayer [][] = [];
    private showBuyIn = false;
    private showSetting = false;
    private sitLink: any = '';
    private raiseSize: number = 0;
    private gaming = false;
    private sitList: ISit[] = [];
    private actionUserId = '';
    private showMsg = false;
    private msg = '';
    private raiseSizeMap = {
      firsAction: {
        two: 2,
        three: 3,
        four: 4,
      },
      other: {
        oneThirdPot: 0.5,
        halfPot: 0.75,
        pot: 1,
      },
    };

    @Watch('players')
    private playerChange(players: IPlayer[]) {
      console.log('player change-------');
      this.sitList = this.sitList.map((sit: ISit) => {
        const player = players.find((p) => p.userId === sit.player?.userId);
        return Object.assign({}, {}, {player, position: sit.position}) as ISit;
      });
      this.initSitLink();
    }

    get isPlay() {
      return this.gaming || this.pot !== 0;
    }

    get roomId() {
      return this.$route.params.roomNumber;
    }

    get isOwner() {
      return !!this.$route.params.isOwner;
    }

    get gameOver() {
      return this.winner.length !== 0;
    }

    get valueCards() {
      if (this.gameOver && this.winner[0] && this.winner[0][0].handCard) {
        const handCards = this.winner[0][0].handCard;
        const style = new PokerStyle([...handCards, ...this.commonCard]);
        return style.getPokerValueCard();
      } else {
        return [];
      }
    }

    get gamePlayers() {
      if (!this.isPlay) {
        return [];
      }
      return this.sitList.filter((s) => s.player && s.player.status === 1);
    }

    get hasSit() {
      return !!this.sitList.find((s) => s.player && s.player.userId === this.currPlayer?.userId);
    }

    get currPlayer() {
      return this.players.find((u: IPlayer) => this.userInfo.userId === u.userId);
    }

    get canActionSize() {
      return Number(this.currPlayer && this.currPlayer.counter + this.currPlayer.actionSize);
    }

    get commonCardString() {
      const commonCardFlag: string[][] = [[], [], [], [], []];
      const commonCardMap = map(this.commonCard);
      commonCardMap.forEach((card, key) => {
        commonCardFlag[key] = card;
      });
      return commonCardFlag;
    }

    get minActionSize() {
      return this.prevSize <= 0 ? GAME_BASE_SIZE * 2 : this.prevSize * 2;
    }

    private init() {
      this.raiseSize = 0;
      this.joinMsg = '';
      this.handCard = [];
      this.commonCard = [];
      this.pot = 0;
      this.prevSize = 0;
      this.isAction = false;
      this.isRaise = false;
      this.winner = [];
      this.showBuyIn = false;
    }

    private PokeStyle(cards: string[]) {
      if (this.commonCard.length === 0 || !cards) {
        return '';
      }
      const commonCards = this.commonCard || [];
      const card = [...cards, ...commonCards];
      console.log(card, 'poke style =======================');
      const style = new PokerStyle(card);
      return style.getPokerStyleName();
    }

    private showActionSize(multiple: number) {
      // big then double pre-size and small then counter
      return this.currPlayer
        && this.currPlayer.counter > Math.floor(multiple * this.pot)
        && this.prevSize * 2 <= Math.floor(multiple * this.pot)
        && GAME_BASE_SIZE * 2 <= Math.floor(multiple * this.pot);
    }

    private otherSizeHandle() {
      this.isRaise = true;
      this.raiseSize = this.minActionSize;
    }

    private showBuyInDialog() {
      this.showBuyIn = true;
      this.showSetting = false;
    }

    private closeBuyIn() {
      this.showBuyIn = false;
    }

    private addSize() {
      if (this.raiseSize === this.currPlayer?.counter) {
        this.action('allin');
      } else {
        this.action(`raise:${this.raiseSize}`);
      }
    }

    private sitListMap() {
      let node = this.sitLink;
      const sit = [];
      for (let i = 0; i < 9; i++) {
        sit.push(node.node);
        const next = node.next;
        node = next;
      }
      return sit;
    }

    private sitDown() {
      this.emit('sitDown', {sitList: this.sitListMap()});
    }

    // private mapCard(cards: string []) {
    //   const cardNumber = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
    //   const color = ['♦', '♣', '♥', '♠'];
    //   return cards?.map((c: string) => {
    //     const cNumber = c.charCodeAt(0) - 97;
    //     const cColor = Number(c[1]) - 1;
    //     return [`${cardNumber[cNumber]}`, `${color[cColor]}`];
    //   });
    // }

    private showActionBtn(type: string) {
      // check
      if ('check' === type) {
        return this.prevSize <= 0
          || (this.commonCard.length === 0
            && this.gamePlayers.length === 2
            && this.currPlayer?.type === 'd'
            && this.prevSize === 2)
          || (this.currPlayer?.type === 'bb' && this.prevSize === 2 &&
            this.commonCard.length === 0);
      }
      // raise
      if ('raise' === type) {
        return this.canActionSize > this.prevSize * 2;
      }
      // call
      if ('call' === type) {
        return this.canActionSize > this.prevSize
          && this.prevSize > 0
          && !((this.commonCard.length === 0
            && this.gamePlayers.length === 2
            && this.currPlayer?.type === 'd'
            && this.prevSize === 2 * GAME_BASE_SIZE)
            || (this.currPlayer?.type === 'bb' && this.prevSize === 2 * GAME_BASE_SIZE &&
              this.commonCard.length === 0));
      }
      return true;
    }

    private raise(size: number) {
      const realSize = size === 0 ? this.prevSize * 2 : size * this.pot;
      this.action(`raise:${Math.floor(realSize)}`);
    }

    private getBuyInSize(size: number) {
      this.raiseSize = size;
    }

    private action(command: string) {
      this.emit('action', {command});
      this.isAction = false;
      this.isRaise = false;
    }

    private socketInit() {
      const token = cookie.get('token');
      const log = console.log;
      // const origin = 'http://172.22.72.70:7001';
      const origin = 'http://192.168.0.110:7001';
      // const origin = 'http://www.jojgame.com:7001';
      this.socket = io(`${origin}/socket`, {
        // 实际使用中可以在这里传递参数
        query: {
          room: this.roomId,
          token,
        },
        transports: ['websocket'],
      });
      this.socket.on('connect', () => {
        const id: string = this.socket.id;

        log('#connect,', id, this.socket);

        // 监听自身 id 以实现 p2p 通讯
        this.socket.on(id, (msg: any) => {
          log('#receive,', msg);
          const data = msg.data;
          if (data.action === 'handCard') {
            console.log('come in handCard =========', data);
            this.handCard = data.payload.handCard;
            console.log('come in handCard =========', this.handCard);
          }
          if (data.action === 'userInfo') {
            this.userInfo = data.payload.userInfo;
          }
          if (data.action === 'sitList') {
            this.sitList = data.payload.sitList;
            this.initSitLink();
          }
          if (data.action === 'gameInfo') {
            const payload = data.payload;
            this.players = payload.data.players;
            this.pot = payload.data.pot || 0;
            this.prevSize = payload.data.prevSize;
            this.commonCard = payload.data.commonCard;
            console.log('msg.data.currPlayer.userId', msg.data);
            this.actionUserId = payload.data.currPlayer.userId;
            this.isAction = !!(this.userInfo && this.userInfo.userId ===
              payload.data.currPlayer.userId);
          }
        });
      });

      // 接收在线用户信息
      this.socket.on('online', (msg: IMsg) => {
        log('#online,', msg);
        if (msg.action === 'sitList') {
          console.log(msg.data, 'sit');
          this.sitList = msg.data.sitList;
          this.initSitLink();
        }
        if (msg.action === 'join') {
          this.joinMsg = msg.data;
        }
        if (msg.action === 'players') {
          this.players = msg.data.players;
        }
        if (msg.action === 'commonCard') {
          this.commonCard = msg.data.commonCard;
          console.log('players', msg.data);
        }
        if (msg.action === 'gameInfo') {
          this.players = msg.data.players;
          this.pot = msg.data.pot || 0;
          this.prevSize = msg.data.prevSize;
          this.actionUserId = msg.data.currPlayer.userId;
          this.isAction = !!(this.userInfo && this.userInfo.userId === msg.data.currPlayer.userId);
          this.sitList = msg.data.sitList;
          console.log('gameInfo', msg.data);
          console.log('handCard', this.handCard);
        }

        if (msg.action === 'gameOver') {
          console.log('gameOver', msg.data);
          this.winner = msg.data.winner;
          const allPlayers = msg.data.allPlayers;
          allPlayers.forEach((winner: IPlayer) => {
            this.players.forEach((p) => {
              if (winner.userId === p.userId) {
                p.handCard = winner.handCard;
                p.counter = winner.counter;
                p.income = winner.income;
              }
            });
          });
        }

        if (msg.action === 'newGame') {
          this.init();
        }
      });

      // 系统事件
      this.socket.on('disconnect', (msg: IMsg) => {
        log('#disconnect', msg);
      });

      this.socket.on('disconnecting', () => {
        log('#disconnecting');
      });

      this.socket.on('error', () => {
        log('#error');
      });
    }

    private async buyIn(size: number) {
      try {
        if (this.currPlayer && (!this.isPlay || !this.hasSit)) {
          this.currPlayer.counter += size;
        }
        this.emit('buyIn', {
          buyInSize: size,
        });
        this.showMsg = true;
        this.msg = this.hasSit ? `已补充买入 ${ size }, 下局生效` : `已补充买入 ${ size }`;
      } catch (e) {
        console.log(e);
      }
    }

    private play() {
      if (this.players.length >= 2) {
        this.gaming = true;
        this.emit('playGame');
      } else {
        console.log('no enough player');
      }
    }

    private emit(eventType: string, data: any = {}) {
      this.socket.emit(eventType, {
        target: '',
        payload: {
          ...data,
        },
      });
    }

    private initSitLink() {
      const sitListMap = this.sitList || [];
      if (sitListMap.length === 0) {
        for (let i = 0; i < 9; i++) {
          const sit = {
            player: null,
            position: i + 1,
          };
          sitListMap.push(sit);
        }
      }
      let link = new Link<ISit>(sitListMap).link;
      for (let i = 0; i < 9; i++) {
        if (link.node.player
          && link.node.player.userId === this.currPlayer?.userId) {
          this.sitLink = link;
          return;
        }
        const next = link.next;
        link = next as ILinkNode<ISit>;
      }
      this.sitLink = link;
    }

    private created() {
      try {
        this.socketInit();
        if (!this.sitLink) {
          this.initSitLink();
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
</script>

<style lang="less"
       scoped>
  .game-container {
    background: url("../assets/bg.png");
    background-size: 100% 100%;

    .winner-poke-style {
      position: absolute;
      top: 55vh;
      left: 50%;
      transform: translate3d(-50%, 0, 0);
      z-index: 0;
      font-size: 14px;
      color: #fff;
    }

    .game-body {
      position: absolute;
      top: 38vh;
      left: 50%;
      transform: translate3d(-50%, -50%, 0);
      z-index: 0;
    }


    .action {
      position: absolute;
      color: #fff;
      width: 80vw;
      top: 65vh;
      left: 50%;
      transform: translateX(-50%);

      .raise-size {
        position: absolute;
        top: -7vh;
        left: 50%;
        width: 53vw;
        margin-left: -26.4vw;
        text-align: center;

        i {
          padding: 2px;
          width: 24px;
          height: 24px;
          display: inline-block;
          font-style: normal;
          font-size: 10px;
          line-height: 24px;
          border-radius: 50%;
          color: #fff;
          border: 1px solid #fff;
          background: rgba(0, 0, 0, .2);
          margin: 10px;
          vertical-align: middle;
        }
      }

      .action-btn {
        span {
          border-radius: 50%;
          width: 40px;
          height: 40px;
          padding: 2px;
          text-align: center;
          margin: 0 10px;
          line-height: 40px;
          border: 1px solid #fff;
          font-size: 14px;
          display: inline-block;
        }
      }

      .action-other-size {
        background-color: rgba(0, 0, 0, 0);
        position: fixed;
        width: 50vw;
        height: 30vh;
        right: -16px;
        top: -35vh;
        z-index: 90;

        .shadow {
          position: absolute;
          top: -30vh;
          width: 99vw;
          height: 100vh;
          right: -5vw;
          z-index: 8;
          overflow: hidden;
          background: linear-gradient(-70deg, black, transparent);
        }

        .action-other-size-body {
          z-index: 9;
          position: absolute;
          width: 50vw;
          height: 30vh;

          .btn {
            position: absolute;
            top: 34vh;
            left: 20vw;
            border: 1px solid #fff;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.4);
            padding: 5px;
            font-size: 12px;
            width: 20px;
            height: 20px;
            line-height: 20px;
          }
        }
      }
    }

    .setting {
      left: 0;
      top: 0;
      position: absolute;

      .setting-btn {
        width: 30px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        background: #fff;
        top: 10px;
        left: 0;
        position: absolute;
        font-size: 20px;
        color: #898888;
        border-radius: 0 10px 10px 0;
      }

      .setting-body {
        position: absolute;
        left: 0;
        top: 0;
        transform: translate3d(-150px, 0px, 0px);
        z-index: 1;
        transition: transform .5s;

        i {
          display: block;
          width: 100px;
          height: 20px;
          padding: 4px;
          font-style: normal;
          text-align: left;
          line-height: 20px;
          font-size: 12px;
          color: #fff;
          background: rgba(0, 0, 0, 0.6);
        }

        &.show {
          transform: translate3d(0, 0, 0);
        }
      }
    }
  }
</style>
