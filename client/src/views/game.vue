<template>
  <div class="game-container container">
    <sitList></sitList>
    <common-card></common-card>
    <div class="game-body" v-show="hasBuyIn">
      <div class="game-player-info">
        <div class="users"
             v-for="user in users">
          <span> {{user.nickName}}: {{user.counter}}</span>
          <span>buyIn: {{user.buyIn}}</span>
          <span v-show="user.actionSize > 0"> actionSize:{{user.actionSize}} </span>
          <span v-show="user.type"> type:{{user.type}} </span>
          <span v-show="gameOver && user.handCard">handCard: {{mapCard(user.handCard)}}</span>
        </div>
        <div class="join">
          {{joinMsg}}
        </div>
      </div>
      <div class="pot">pot: {{pot}}</div>
      <div class="common-card">commonCard:{{commonCardString}}</div>
      <div class="hand-card">handCard:{{handCardString}}</div>
      <div class="action">
        <div class="action-type btn"
             v-show="isAction">
          <span @click="action('check')"
                v-show="showActionBtn('check')">check</span>
          <span @click="action('fold')">fold</span>
          <span @click="action('call')"
                v-show="showActionBtn('call')">call</span>
          <span @click="isRaise = true">raise</span>
        </div>
        <div class="raise-size"
             v-show="isRaise">
          <div class="not-allin"
               v-show="showActionBtn('raise')">
            <i @click="raise(pot / 3)">1/3 pot</i>
            <i @click="raise(pot / 2)">1/2 pot</i>
            <i @click="raise(pot / 4)">3/4 pot</i>
            <i @click="raise(pot)">1 pot</i>
            <i @click="raise(pot * 2)">2 pot</i>
            <i @click="raise(pot * 3)">3 pot</i>
          </div>
          <i @click="action('allin')">allin</i>
        </div>
      </div>
      <div class="btn play"
           v-show="isOwner && !isPlay"><span @click="play">play game</span></div>
    </div>
    <div class="buy-in">
      <div class="input-bd">
        <div class="input-name">buy in:</div>
        <div class="input-text">
          <input type="text"
                 v-model="buyInSize"/>
        </div>
      </div>
      <div class="btn"><span @click="buyIn">buy in</span></div>
    </div>
  </div>
</template>

<script lang="ts">
  import {Vue} from 'vue-property-decorator';
  import Component from 'vue-class-component';
  import io from 'socket.io-client';
  import cookie from 'js-cookie';
  import sitList from '../components/SitList.vue';
  import commonCard from '../components/CommonCard.vue';
  import {IUser} from '@/interface/user';

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
    },
  })
  export default class Game extends Vue {
    public socket: any = null;
    private users: IUser[] = [];
    private userInfo: any = {};
    private joinMsg = '';
    private handCard = [];
    private commonCard = [];
    private buyInSize = 0;
    private pot = 0;
    private prevSize = 0;
    private isAction = false;
    private isRaise = false;
    private winner = [];
    private showBuyIn = true;

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
      return this.users.find((u: IUser) => this.userInfo.userId === u.userId);
    }

    get canActionSize() {
      return Number(this.currPlayer && this.currPlayer.counter + this.currPlayer.actionSize);
    }

    get commonCardString() {
      return this.mapCard(this.commonCard);
    }

    get handCardString() {
      return this.mapCard(this.handCard);
    }

    private init() {
      this.users = [];
      this.userInfo = {};
      this.joinMsg = '';
      this.handCard = [];
      this.commonCard = [];
      this.buyInSize = 0;
      this.pot = 0;
      this.prevSize = 0;
      this.isAction = false;
      this.isRaise = false;
      this.winner = [];
      this.showBuyIn = true;
    }

    private mapCard(cards: string []) {
      const cardNumber = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
      const color = ['♦', '♣', '♥', '♠'];
      return cards?.map((c: string) => {
        const cNumber = c.charCodeAt(0) - 97;
        const cColor = Number(c[1]) - 1;
        return `${cardNumber[cNumber]}${color[cColor]}`;
      });
    }

    private showActionBtn(type: string) {
      // check
      if ('check' === type) {
        return this.prevSize <= 0
          || (this.commonCard.length === 0
            && this.users.length === 2
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
      const origin = 'http://192.168.0.101:7001';
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
            this.userInfo = data.payload;
          }
          if (data.action === 'gameInfo') {
            const payload = data.payload;
            this.users = payload.data.players;
            this.pot = payload.data.pot;
            this.prevSize = payload.data.prevSize;
            console.log('msg.data.currPlayer.userId', msg.data);
            this.isAction = !!(this.userInfo && this.userInfo.userId ===
              payload.data.currPlayer.userId);
          }
        });
      });

      // 接收在线用户信息
      this.socket.on('online', (msg: IMsg) => {
        log('#online,', msg);
        if (msg.action === 'join') {
          this.joinMsg = msg.data;
        }
        if (msg.action === 'players') {
          this.users = msg.data.players;
        }
        if (msg.action === 'commonCard') {
          this.commonCard = msg.data.commonCard;
          console.log('users', msg.data);
        }
        if (msg.action === 'gameInfo') {
          this.users = msg.data.players;
          this.pot = msg.data.pot;
          this.prevSize = msg.data.prevSize;
          this.isAction = !!(this.userInfo && this.userInfo.userId === msg.data.currPlayer.userId);
          console.log('gameInfo', msg.data);
        }

        if (msg.action === 'gameOver') {
          console.log('gameOver', msg.data);
          this.winner = msg.data.winner;
          const allPlayers = msg.data.allPlayers;
          allPlayers.forEach((w: IUser) => {
            this.users.forEach((p) => {
              if (w.userId === p.userId) {
                p.handCard = w.handCard;
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

    private async buyIn() {
      try {
        this.emit('buyIn', {
          buyInSize: this.buyInSize,
        });
        this.showBuyIn = false;
      } catch (e) {
        console.log(e);
      }
    }

    private play() {
      console.log('play');
      this.emit('playGame');
    }

    private emit(eventType: string, data: any = {}) {
      this.socket.emit(eventType, {
        target: '',
        payload: {
          ...data,
        },
      });
    }

    private mounted() {
      this.socketInit();
    }
  }
</script>

<style lang="less"
       scoped>
  .game-container {
    background: url("../assets/bg.png");
    background-size: 100% 100%;
    .raise-size {
      i {
        padding: 5px;
        width: 30px;
        height: 30px;
        display: inline-block;
        font-style: normal;
        font-size: 12px;
        line-height: 30px;
        border-radius: 50%;
        border: 1px solid #bababa;
        margin: 10px;
        vertical-align: middle;
      }
    }

    .sit-list {
      .sit {
        i {

        }
      }
    }
  }
</style>
