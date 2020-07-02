<template>
  <div class="game-container container">
    <sitList :sitLink.sync='sitLink'
             :currPlayer="currPlayer"
             :commonCard="commonCard"
             @sit="sitDown"
             @buyIn="buyIn"
             :isPlay='isPlay'
             :valueCards='valueCards'
             :roomConfig = 'roomConfig'
             :time='time'
             :winner="winner"
             :actionUserId='actionUserId'
             :hand-card="handCard"></sitList>
    <common-card
      :commonCard="commonCard"
      :valueCards='valueCards'
    ></common-card>
    <notice :message-list="messageList"></notice>
    <div class="winner-poke-style"
         v-show="gameOver && winner[0][0].handCard.length > 0">
      {{PokeStyle(winner[0] && winner[0][0] && winner[0][0].handCard)}} WIN!!
    </div>
    <div class="game-body">
      <div class="pot">pot: {{pot}}</div>
      <div class="roomId">No.:{{roomId}}</div>
      <div class="btn play"
           v-show="isOwner && !isPlay"><span @click="play">play game</span></div>
    </div>
    <actionDialog :base-size="baseSize"
            :curr-player="currPlayer"
            :is-action="isAction"
            :is-pre-flop="commonCard.length === 0"
            :min-action-size="minActionSize"
            :is-two-player="gamePlayers.length === 2"
            :pot="pot"
            :prev-size="prevSize"
            @action = 'action'
    ></actionDialog>
    <div class="setting">
      <div class="iconfont icon-setting setting-btn"
           @click="showSetting = true"></div>
      <div class="setting-body"
           :class="{show: showSetting}">
        <i @click="showBuyInDialog()">buy in</i>
        <i @click="showCounterRecord">counter record</i>
      </div>
    </div>
    <BuyIn :showBuyIn.sync='showBuyIn'
           :min='0'
           :max='1000'
           @buyIn='buyIn'></BuyIn>
    <toast :show.sync="showMsg"
           :text="msg"></toast>
    <record :players="players"
            v-model="showRecord"></record>
    <sendMsg @send = 'sendMsgHandle'></sendMsg>
    <iAudio :play="playIncome" type="income"></iAudio>
  </div>
</template>

<script lang="ts">
  import { Vue, Watch } from 'vue-property-decorator';
  import Component from 'vue-class-component';
  import io from 'socket.io-client';
  import cookie from 'js-cookie';
  import sitList from '../components/SitList.vue';
  import commonCard from '../components/CommonCard.vue';
  import { IPlayer } from '@/interface/IPlayer';
  import { ILinkNode, Link } from '@/utils/Link';
  import ISit from '../interface/ISit';
  import BuyIn from '../components/BuyIn.vue';
  import range from '../components/range.vue';
  import toast from '../components/toast.vue';
  import record from '../components/record.vue';
  import notice from '../components/notice.vue';
  import iAudio from '../components/audio.vue';
  import sendMsg from '../components/sendMsg.vue';
  import actionDialog from '../components/Action.vue';
  import map from '../utils/map';
  import { PokerStyle } from '@/utils/PokerStyle';
  import origin from '../utils/origin';
  import { IRoom } from '@/interface/IRoom';

  export enum ECommand {
    CALL   = 'call',
    ALL_IN = 'allin',
    RAISE  = 'raise',
    CHECK  = 'check',
    FOLD   = 'fold',
  }

  interface IMsg {
    action: string;
    clients: string[];
    target: string;
    message?: any;
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
      record,
      notice,
      iAudio,
      actionDialog,
      sendMsg,
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
    private slidePots = [];
    private prevSize = 0;
    private winner: IPlayer [][] = [];
    private showBuyIn = false;
    private showSetting = false;
    private sitLink: any = '';
    private gaming = false;
    private sitList: ISit[] = [];
    private actionUserId = '';
    private showMsg = false;
    private baseSize = GAME_BASE_SIZE;
    private playIncome = false;
    private msg = '';
    private time = 30;
    private timeSt = 0;
    private roomConfig: IRoom = {
      isShort: false,
      smallBlind: 1
    };
    private messageList: any[] = [];
    private showRecord = false;

    @Watch('players')
    private playerChange(players: IPlayer[]) {
      console.log('player change-------');
      this.sitList = this.sitList.map((sit: ISit) => {
        const player = players.find(
          (p) => sit.player && p.userId === sit.player.userId && sit.player.counter > 0);
        return Object.assign({}, {}, { player, position: sit.position }) as ISit;
      });
      this.initSitLink();
    }

    @Watch('isPlay')
    private isPlayChange(val: boolean) {
      if (val) {
        clearTimeout(this.timeSt);
        this.doCountDown();
      }
    }

    @Watch('actionUserId')
    private actionUserIdChange() {
      this.time = 30;
      clearTimeout(this.timeSt);
      this.doCountDown();
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

    get isAction() {
      return this.userInfo && this.userInfo.userId === this.actionUserId;
    }

    get valueCards() {
      if (this.gameOver && this.winner[0] && this.winner[0][0].handCard) {
        const handCards = this.winner[0][0].handCard;
        const style = new PokerStyle([...handCards, ...this.commonCard], this.roomConfig.isShort);
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
      this.joinMsg = '';
      this.handCard = [];
      this.commonCard = [];
      this.pot = 0;
      this.prevSize = 0;
      this.time = 30;
      this.winner = [];
      this.showBuyIn = false;
      this.initSitLink();
    }

    private sendMsgHandle(msgInfo: string) {
      const msg = `${this.userInfo.nickName}:${msgInfo}`;
      this.emit('broadcast', { msg });
    }

    private showCounterRecord() {
      this.showRecord = true;
      this.showSetting = false;
    }

    private doCountDown() {
      if (this.time <= 0) {
        clearTimeout(this.timeSt);
        return;
      }
      this.timeSt = setTimeout(() => {
        this.time--;
        this.doCountDown();
      }, 1000);
    }

    private PokeStyle(cards: string[]) {
      if (this.commonCard.length === 0 || !cards) {
        return '';
      }
      const commonCards = this.commonCard || [];
      const card = [...cards, ...commonCards];
      const style = new PokerStyle(card, this.roomConfig.isShort);
      return style.getPokerStyleName();
    }

    private showBuyInDialog() {
      this.showBuyIn = true;
      this.showSetting = false;
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
      this.emit('sitDown', { sitList: this.sitListMap() });
    }

    private action(command: string) {
      if (command === 'fold') {
        clearTimeout(this.timeSt);
      }
      this.emit('action', { command });
      // this.isAction = false;
      // this.isRaise = false;
    }

    private socketInit() {
      const token = cookie.get('token');
      const roomConfig = cookie.get('roomConfig') || '';
      const log = console.log;
      this.roomConfig = JSON.parse(roomConfig);
      console.log(JSON.parse(roomConfig), 'roomConfig');
      this.socket = io(`${origin.url}/socket`, {
        // 实际使用中可以在这里传递参数
        query: {
          room: this.roomId,
          token,
          roomConfig: roomConfig,
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
            // this.isAction = !!(this.userInfo
            //   && this.userInfo.userId === payload.data.currPlayer.userId);
          }

          // room time out
          if (data.action === 'deny') {
            this.$plugin.toast('room is close');
            setTimeout(() => {
              this.$router.replace({ name: 'home' });
            }, 1000);
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
        if (msg.action === 'actionComplete') {
          this.commonCard = msg.data.commonCard;
          this.slidePots = msg.data.slidePots;
          console.log('players', msg.data);
        }
        if (msg.action === 'gameInfo') {
          this.players = msg.data.players;
          this.pot = msg.data.pot || 0;
          this.prevSize = msg.data.prevSize;
          this.actionUserId = msg.data.currPlayer.userId;
          // this.isAction = !!(this.userInfo && this.userInfo.userId === msg.data.currPlayer.userId);
          this.sitList = msg.data.sitList;
          console.log('gameInfo', msg.data);
          console.log('handCard', this.handCard);
        }

        if (msg.action === 'gameOver') {
          console.log('gameOver', msg.data);
          clearTimeout(this.timeSt);
          this.actionUserId = '0';
          this.winner = msg.data.winner;
          this.commonCard = msg.data.commonCard;
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
          // income music
          this.playIncome = true;
          setTimeout(() => {
            this.playIncome = false;
          }, 1000)
        }

        if (msg.action === 'newGame') {
          this.init();
        }

        if (msg.action === 'pause') {
          this.players = msg.data.players;
          this.sitList = msg.data.sitList;
          console.log('players', this.players);
          this.gaming = false;
          this.init();
        }

        if (msg.action === 'broadcast') {
          this.messageList.push({
            message: msg.message.msg || '',
            top: Math.random() * 50 + 10,
          });
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
      if (size <= 0) {
        this.$plugin.toast('buy in size too small');
        return;
      }

      try {
        console.log('come in buyIn ==================', size);
        this.showMsg = true;
        this.msg = this.hasSit && this.isPlay
          ? `已补充买入 ${size},下局生效` : `已补充买入 ${size}`;
        this.emit('buyIn', {
          buyInSize: size,
        });
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
    background: radial-gradient(#00bf86, #006a55);
    background-size: 100% 100%;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
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

      .roomId {
        margin-top: 10px;
        font-size: 14px;
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
          margin: 1px 0;
        }

        &.show {
          transform: translate3d(0, 0, 0);
        }
      }
    }
  }
</style>
