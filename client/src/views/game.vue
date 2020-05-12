<template>
  <div class="game-container container">
    <sitList :sitLink.sync='sitLink'
             :curr-player="currPlayer"
             @sit="sitDown"
             @buyIn="buyIn"
             :isPlay = 'isPlay'
             :hand-card="handCardString"></sitList>
    <common-card :cardListString="commonCardString"></common-card>
    <div class="game-body">
<!--      <div class="game-player-info">-->
<!--        &lt;!&ndash;        <div class="users"&ndash;&gt;-->
<!--        &lt;!&ndash;             v-for="user in users">&ndash;&gt;-->
<!--        &lt;!&ndash;          <span> {{user.nickName}}: {{user.counter}}</span>&ndash;&gt;-->
<!--        &lt;!&ndash;          <span>buyIn: {{user.buyIn}}</span>&ndash;&gt;-->
<!--        &lt;!&ndash;          <span v-show="user.actionSize > 0"> actionSize:{{user.actionSize}} </span>&ndash;&gt;-->
<!--        &lt;!&ndash;          <span v-show="user.type"> type:{{user.type}} </span>&ndash;&gt;-->
<!--        &lt;!&ndash;          <span v-show="gameOver && user.handCard">handCard: {{mapCard(user.handCard)}}</span>&ndash;&gt;-->
<!--        &lt;!&ndash;        </div>&ndash;&gt;-->
<!--        <div class="join">-->
<!--          {{joinMsg}}-->
<!--        </div>-->
<!--      </div>-->
      <div class="pot">pot: {{pot}}</div>
      <!--      <div class="common-card">commonCard:{{commonCardString}}</div>-->
      <!--      <div class="hand-card">handCard:{{handCardString}}</div>-->
      <div class="btn play"
           v-show="isOwner && !isPlay"><span @click="play">play game</span></div>
    </div>
    <div class="action" v-show="isAction">
      <div class="action-type action-btn">
          <span @click="action('check')"
                v-show="showActionBtn('check')">check</span>
        <span @click="action('fold')">fold</span>
        <span @click="action('call')"
              v-show="showActionBtn('call')">call</span>
        <span @click="isRaise = true" v-show="showActionBtn('raise')">raise</span>
        <span @click="action('allin')" v-show="!showActionBtn('raise')">allin</span>
      </div>
      <div class="raise-size">
        <div class="not-allin"
             v-show="showActionBtn('raise')">
          <i @click="raise(Math.floor(pot / 3))">{{Math.floor(pot / 3)}}</i>
          <i @click="raise(Math.floor(pot / 2))">{{Math.floor(pot / 2)}}</i>
          <i @click="raise(pot)">{{pot}}</i>
          <i @click="raise(pot * 2)">{{2*pot}}</i>
        </div>
      </div>
    </div>
    <div class="setting">
      <div class="iconfont icon-setting setting-btn" @click="showSetting = true"></div>
      <div class="setting-body" :class="{show: showSetting}">
        <i @click="showBuyInDialog()">buy in</i>
      </div>
    </div>
    <BuyIn :showBuyIn.sync = 'showBuyIn' @buyIn = 'buyIn'></BuyIn>
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

  @Component({
    components: {
      sitList,
      commonCard,
      BuyIn
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
    private winner = [];
    private showBuyIn = false;
    private showSetting = false;
    private sitLink: any = '';
    private sitList: ISit[] = [];

    @Watch('players')
    private playerChange(players: IPlayer[]) {
      this.sitList = this.sitList.map((sit: ISit) => {
        const player = players.find(p => p.userId === sit.player?.userId);
        return Object.assign({}, {}, {player, position: sit.position}) as ISit;
      });
      this.initSitLink();
    }

    get isPlay() {
      return this.pot !== 0 && this.currPlayer?.buyIn !== 0;
    }

    get hasBuyIn() {
      return this.currPlayer?.buyIn !== 0;
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

    get currPlayer() {
      return this.players.find((u: IPlayer) => this.userInfo.userId === u.userId);
    }

    get canActionSize() {
      return Number(this.currPlayer && this.currPlayer.counter + this.currPlayer.actionSize);
    }

    get commonCardString() {
      const commonCardFlag: string[][] = [[], [], [], [], []];
      const commonCardMap = this.mapCard(this.commonCard);
      commonCardMap.forEach((card, key) => {
        commonCardFlag[key] = card;
      });
      return commonCardFlag;
    }

    get handCardString() {
      return this.mapCard(this.handCard);
    }

    private init() {
      this.userInfo = {};
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

    private showBuyInDialog() {
      this.showBuyIn = true;
      this.showSetting = false;
    }

    private closeBuyIn() {
      this.showBuyIn = false;
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

    private mapCard(cards: string []) {
      const cardNumber = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
      const color = ['♦', '♣', '♥', '♠'];
      return cards?.map((c: string) => {
        const cNumber = c.charCodeAt(0) - 97;
        const cColor = Number(c[1]) - 1;
        return [`${cardNumber[cNumber]}`, `${color[cColor]}`];
      });
    }

    private showActionBtn(type: string) {
      // check
      if ('check' === type) {
        return this.prevSize <= 0
          || (this.commonCard.length === 0
            && this.players.length === 2
            && this.currPlayer?.type === 'dealer'
            && this.prevSize === 2)
          || (this.currPlayer?.type === 'big_blind' && this.prevSize === 2 &&
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
          && !(this.currPlayer?.type === 'big_blind' && this.prevSize === 2 &&
            this.commonCard.length === 0);
      }
      return true;
    }

    private raise(size: number) {
      this.action(`raise:${size}`);
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
            this.handCard = data.payload.handCard;
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
            this.pot = payload.data.pot;
            this.prevSize = payload.data.prevSize;
            this.commonCard = payload.data.commonCard;
            console.log('msg.data.currPlayer.userId', msg.data);
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
          this.pot = msg.data.pot;
          this.prevSize = msg.data.prevSize;
          this.isAction = !!(this.userInfo && this.userInfo.userId === msg.data.currPlayer.userId);
          console.log('gameInfo', msg.data);
        }

        if (msg.action === 'gameOver') {
          console.log('gameOver', msg.data);
          this.winner = msg.data.winner;
          const allPlayers = msg.data.allPlayers;
          allPlayers.forEach((winner: IPlayer) => {
            this.players.forEach((p) => {
              if (winner.userId === p.userId) {
                p.handCard = winner.handCard;
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
        this.emit('buyIn', {
          buyInSize: size,
        });
      } catch (e) {
        console.log(e);
      }
    }

    private play() {
      if (this.players.length >= 2) {
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
        if (link.node.player && link.node.player.userId === this.currPlayer?.userId) {
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
        margin-left: -26.4vw;

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
