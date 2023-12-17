<template>
  <div class="game-container container">
    <sitList
      :sitLink.sync="sitLink"
      :currPlayer="currPlayer"
      :commonCard="commonCard"
      @sit="sitDown"
      @buyIn="buyIn"
      :isPlay="isPlay"
      :valueCards="valueCards"
      :roomConfig="roomConfig"
      @delay="delay"
      :time.sync="time"
      :winner="winner"
      :actionUserId="actionUserId"
      :hand-card="handCard"
    ></sitList>

    <div class="game-canvas">
      <animation
        class="action-notice"
        :animationName="latestSpecialActionMsg.toLocaleLowerCase().includes('allin') ? 'tada' : 'heartBeat'"
        ref="actionNotice"
        v-show="latestSpecialActionMsg"
      >
        {{ latestSpecialActionMsg }}
      </animation>
      <div class="game-body">
        <div class="pot">pot: {{ pot }}</div>
        <div class="roomId">No.:{{ roomId }}</div>
        <div class="btn play" v-show="isOwner && !isPlay">
          <span @click="play">play game</span>
        </div>
      </div>
      <common-card class="common-cards" :commonCard="commonCard" :valueCards="valueCards"></common-card>
      <div class="winner-poke-style" v-show="gameOver && winner[0][0].handCard.length > 0">
        {{ PokeStyle(winner[0] && winner[0][0] && winner[0][0].handCard) }} WIN!!
      </div>
    </div>

    <actionDialog
      :base-size="baseSize"
      :curr-player="currPlayer"
      :is-action="isAction"
      :is-pre-flop="commonCard.length === 0"
      :min-action-size="minActionSize"
      :is-two-player="gamePlayers.length === 2"
      :pot="pot"
      :audio-status="audioStatus"
      :prev-size="prevSize"
      @action="action"
    ></actionDialog>

    <notice :message-list="messageList"></notice>
    <div class="game-record iconfont icon-record" @click="getRecord(0)"></div>
    <div class="setting">
      <div class="iconfont icon-setting setting-btn" @click="showSetting = true"></div>
      <div class="setting-body" :class="{ show: showSetting }">
        <i @click="showBuyInDialog()">buy in</i>
        <i @click="standUp()">stand Up</i>
        <i @click="showCounterRecord">counter record</i>
        <i @click="closeAudio()">audio ({{ `${audioStatus ? 'open' : 'close'}` }})</i>
      </div>
    </div>
    <BuyIn :showBuyIn.sync="showBuyIn" :min="0" :max="baseSize * 1000" @buyIn="buyIn"></BuyIn>
    <toast :show.sync="showMsg" :text="msg"></toast>
    <record :players="players" v-model="showRecord"></record>
    <sendMsg @send="sendMsgHandle" :msg-list="msgListReverse"></sendMsg>
    <iAudio :play="playIncome && audioStatus" type="income"></iAudio>
    <iAudio :play="playRaiseNotice && audioStatus" type="raise-notice"></iAudio>
    <iAudio :play="playAllInNotice && audioStatus" type="allin-notice"></iAudio>
    <gameRecord
      v-model="showCommandRecord"
      :game-list="gameList"
      @getRecord="getRecord"
      :curr-game-index="currGameIndex"
      :command-list="commandRecordList"
    ></gameRecord>
  </div>
</template>

<script lang="ts">
import { Ref, Vue, Watch } from 'vue-property-decorator';
import Component from 'vue-class-component';
import io from 'socket.io-client';
import cookie from 'js-cookie';
import sitList from '../components/SitList.vue';
import commonCard from '../components/CommonCard.vue';
import { IPlayer } from '@/interface/IPlayer';
import { ILinkNode, Link } from '@/utils/Link';
import ISit from '../interface/ISit';
import BuyIn from '../components/BuyIn.vue';
import toast from '../components/Toast.vue';
import record from '../components/Record.vue';
import notice from '../components/Notice.vue';
import iAudio from '../components/Audio.vue';
import sendMsg from '../components/SendMsg.vue';
import animation from '@/components/Animation.vue';
import actionDialog from '../components/Action.vue';
import { PokerStyle } from '@/utils/PokerStyle';
import origin from '../utils/origin';
import { IRoom } from '@/interface/IRoom';
import service from '../service';
import gameRecord from '@/components/GameRecord.vue';
import { IGameRecord } from '@/interface/IGameRecord';
import { Online, OnlineAction, P2PAction } from '@/utils/constant';

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
  message?: any;
  data: any;
}

interface ILatestActionData {
  userId: string;
  nickName: string;
  /** call, check, raise:4, raise:100, fold, allin */
  latestAction: string;
}

const GAME_BASE_SIZE = 1;
const ACTION_TIME = 30;

@Component({
  components: {
    sitList,
    commonCard,
    BuyIn,
    toast,
    record,
    gameRecord,
    notice,
    iAudio,
    actionDialog,
    sendMsg,
    animation,
  },
})
export default class Game extends Vue {
  get msgListReverse() {
    const msg = JSON.parse(JSON.stringify(this.messageList));
    return msg.reverse();
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

  get minActionSize() {
    return this.prevSize <= 0 ? this.baseSize * 2 : this.prevSize * 2;
  }

  get baseSize() {
    return this.roomConfig.smallBlind || GAME_BASE_SIZE;
  }

  get latestSpecialActionMsg() {
    const specialActions = [ECommand.RAISE, ECommand.ALL_IN];
    const latestSpecialAction = this.currentRoundActions
      .filter((action) => specialActions.includes(action.latestAction.split(':')[0] as ECommand))
      .pop();
    if (!latestSpecialAction) {
      return '';
    }
    if (latestSpecialAction.latestAction.includes(ECommand.ALL_IN)) {
      return `${latestSpecialAction.nickName} ALL IN`;
    }
    if (latestSpecialAction.latestAction.includes(ECommand.RAISE)) {
      const size = latestSpecialAction.latestAction.split(':')[1];
      return `${latestSpecialAction.nickName} raise to ${this.pot}(+${size})`;
    }
    return '';
  }

  public socket: any = null;
  @Ref() public readonly actionNotice!: animation;
  // in the room user
  // have a sit user
  private players: IPlayer[] = [];
  private currentRoundActions: ILatestActionData[] = [];
  private userInfo: any = {};
  private joinMsg = '';
  private handCard = [];
  private commonCard = [];
  private pot = 0;
  private slidePots = [];
  private prevSize = 0;
  private winner: IPlayer[][] = [];
  private showBuyIn = false;
  private showSetting = false;
  private sitLink: any = '';
  private gaming = false;
  private sitList: ISit[] = [];
  private actionUserId = '';
  private showAllin = false;
  private showMsg = false;
  private playIncome = false;
  private msg = '';
  private time = ACTION_TIME;
  private timeSt = 0;
  private commandRecordList = [];
  private actionEndTime = 0;
  private showCommandRecord = false;
  private gameList: IGameRecord[] = [];
  private currGameIndex = 0;
  private audioStatus = true;
  private roomConfig: IRoom = {
    isShort: false,
    smallBlind: 1,
  };
  private messageList: any[] = [];
  private showRecord = false;
  private playRaiseNotice = false;
  private playAllInNotice = false;

  @Watch('latestSpecialActionMsg')
  public privateActionNoticeChange() {
    this.actionNotice?.applyAnimation();
  }

  @Watch('players')
  private playerChange(players: IPlayer[]) {
    console.log('player change-------');
    this.sitList = this.sitList.map((sit: ISit) => {
      const player = players.find((p) => sit.player && p.userId === sit.player.userId && sit.player.counter > 0);
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
    if (this.isPlay && this.actionEndTime) {
      console.log('action player change-------', this.actionEndTime);
      const now = Date.now();
      this.time = Math.floor((this.actionEndTime - now) / 1000);
      clearTimeout(this.timeSt);
      this.doCountDown();
    }
  }

  private init() {
    this.joinMsg = '';
    this.handCard = [];
    this.commonCard = [];
    this.pot = 0;
    this.prevSize = 0;
    this.time = ACTION_TIME;
    this.winner = [];
    this.showBuyIn = false;
    this.initSitLink();
  }

  private getSocketServerUrl() {
    return `${origin.urls[0]}/socket`;
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
      const now = Date.now();
      this.time = Math.floor((this.actionEndTime - now) / 1000);
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
      node = node.next;
    }
    return sit;
  }

  private sitDown() {
    this.emit('sitDown', { sitList: this.sitListMap() });
  }

  private delay() {
    this.emit('delayTime');
  }

  private action(command: string) {
    if (command === 'fold') {
      clearTimeout(this.timeSt);
    }
    if (command === 'allin') {
      this.showAllin = true;
      setTimeout(() => {
        this.showAllin = false;
      }, 3000);
    }
    this.emit('action', { command });
    // this.isAction = false;
    // this.isRaise = false;
  }

  private socketInit() {
    const token = cookie.get('token') || localStorage.getItem('token') || '';
    const roomConfig = this.getRoomConfig();
    const log = console.log;
    this.roomConfig = JSON.parse(roomConfig);
    console.log(JSON.parse(roomConfig), 'roomConfig');
    this.socket = io(this.getSocketServerUrl(), {
      // 实际使用中可以在这里传递参数
      query: {
        room: this.roomId,
        token,
        roomConfig,
      },
      transports: ['websocket'],
    });
    log('#init,', this.socket);
    this.socket.on('connect', () => {
      const id: string = this.socket.id;
      log('#connect,', id, this.socket);

      // 监听自身 id 以实现 p2p 通讯
      this.socket.on(id, (msg: any) => {
        log('#receive,', msg);
        const data = msg.data;
        if (data.action === P2PAction.HandCard) {
          console.log('come in handCard =========', data);
          this.handCard = data.payload.handCard;
          console.log('come in handCard =========', this.handCard);
        }
        if (data.action === P2PAction.UserInfo) {
          this.userInfo = data.payload.userInfo;
        }
        if (data.action === P2PAction.SitList) {
          this.sitList = data.payload.sitList;
          this.initSitLink();
        }
        if (data.action === P2PAction.GameInfo) {
          const payload = data.payload;
          this.players = payload.data.players;
          this.pot = payload.data.pot || 0;
          this.prevSize = payload.data.prevSize;
          this.commonCard = payload.data.commonCard;
          this.actionEndTime = payload.data.actionEndTime;
          console.log('msg.data.currPlayer.userId', msg.data);
          this.actionUserId = payload.data.currPlayer.userId;
          // this.isAction = !!(this.userInfo
          //   && this.userInfo.userId === payload.data.currPlayer.userId);
        }

        // room time out
        if (data.action === P2PAction.Deny) {
          this.$plugin.toast('room is close');
          setTimeout(() => {
            this.$router.replace({ name: 'home' });
          }, 1000);
        }
      });
    });

    // 接收在线用户信息
    this.socket.on(Online, (msg: IMsg) => {
      log('#online,', msg);
      if (msg.action === OnlineAction.SitList) {
        console.log(msg.data, 'sit');
        this.sitList = msg.data.sitList;
        this.initSitLink();
      }
      if (msg.action === OnlineAction.Join) {
        this.joinMsg = msg.data;
      }
      if (msg.action === OnlineAction.Players) {
        this.players = msg.data.players;
      }
      if (msg.action === OnlineAction.ActionComplete) {
        this.commonCard = msg.data.commonCard;
        this.slidePots = msg.data.slidePots;
        this.actionEndTime = msg.data.actionEndTime || Date.now() + 30 * 1000;
        this.currentRoundActions = [];
        console.log('players', msg.data);
      }
      if (msg.action === OnlineAction.GameInfo) {
        this.players = msg.data.players;
        this.pot = msg.data.pot || 0;
        this.roomConfig.smallBlind = msg.data.smallBlind;
        this.prevSize = msg.data.prevSize;
        this.actionUserId = msg.data.currPlayer.userId;
        this.actionEndTime = msg.data.actionEndTime;
        // this.isAction = !!(this.userInfo && this.userInfo.userId === msg.data.currPlayer.userId);
        this.sitList = msg.data.sitList;
        console.log('gameInfo', msg.data);
        console.log('handCard', this.handCard);
      }

      if (msg.action === OnlineAction.GameOver) {
        console.log('gameOver', msg.data);
        clearTimeout(this.timeSt);
        this.actionUserId = '0';
        this.winner = msg.data.winner;
        this.commonCard = msg.data.commonCard;
        this.currentRoundActions = [];
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
        }, 1000);
      }

      if (msg.action === OnlineAction.NewGame) {
        this.init();
      }

      if (msg.action === OnlineAction.Pause) {
        this.players = msg.data.players;
        this.sitList = msg.data.sitList;
        console.log('players', this.players);
        this.gaming = false;
        this.init();
      }

      if (msg.action === OnlineAction.DelayTime) {
        this.actionEndTime = msg.data.actionEndTime;
        const now = Date.now();
        this.time = Math.floor((this.actionEndTime - now) / 1000);
        // if (this.currPlayer?.userId !== this.actionUserId) {
        //   this.time += 60;
        // }
      }

      if (msg.action === OnlineAction.LatestAction) {
        const data = msg.data as ILatestActionData;
        this.currentRoundActions.push(data);
        const { latestAction, userId: actionUserId } = data;
        if (actionUserId !== this.userInfo.userId) {
          if (latestAction.includes(ECommand.RAISE)) {
            this.playRaiseNotice = true;
            setTimeout(() => {
              this.playRaiseNotice = false;
            }, 1000);
          }
          if (latestAction.includes(ECommand.ALL_IN)) {
            this.playAllInNotice = true;
            setTimeout(() => {
              this.playAllInNotice = false;
            }, 1000);
          }
        }
      }

      if (msg.action === OnlineAction.Broadcast) {
        this.messageList.push({
          message: msg.message.msg || '',
          top: Math.random() * 50 + 10,
        });
      }
    });

    // 系统事件
    this.socket.on('disconnect', (msg: IMsg) => {
      this.$plugin.toast('room is disconnect');
      // this.socketInit();
      log('#disconnect', msg);
    });

    this.socket.on('disconnecting', () => {
      this.$plugin.toast('room is disconnecting');
      log('#disconnecting');
    });

    this.socket.on('error', () => {
      this.$plugin.toast('room is error');
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
      this.msg = this.hasSit && this.isPlay ? `已补充买入 ${size},下局生效` : `已补充买入 ${size}`;
      this.emit('buyIn', {
        buyInSize: size,
      });
    } catch (e) {
      console.log(e);
    }
  }
  private standUp() {
    // player in the game
    if (this.currPlayer && this.currPlayer.status === 1) {
      this.$plugin.toast('sorry, please fold you hand!');
      return;
    }
    this.emit('standUp');
    this.showSetting = false;
  }

  private closeAudio() {
    this.audioStatus = !this.audioStatus;
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
      if (link.node.player && link.node.player.userId === this.currPlayer?.userId) {
        this.sitLink = link;
        return;
      }
      const next = link.next;
      link = next as ILinkNode<ISit>;
    }
    this.sitLink = link;
  }

  private async getRecord(index: number) {
    try {
      let gameId = 0;
      if (!index) {
        const result = await service.gameRecordList(this.roomId);
        this.gameList = Object.values(result.data);
        gameId = this.gameList[this.gameList.length - 1].gameId;
        this.currGameIndex = this.gameList.length;
        console.log('ccc len', this.gameList.length);
      } else {
        this.currGameIndex = index;
        gameId = this.gameList[index - 1].gameId;
      }
      console.log(gameId, 'ccc11');
      const { data } = await service.commandRecordList(this.roomId, gameId);
      this.commandRecordList = data.commandList;
      this.showCommandRecord = true;
      console.log(data);
    } catch (e) {
      console.log(e);
      this.$plugin.toast('cannot find the room');
    }
  }

  private getRoomConfig() {
    return cookie.get('roomConfig') || localStorage.getItem('roomConfig') || '';
  }

  /**
   * 自动加入房间
   * - 会覆盖掉已经加入的房间的配置
   */
  private async autoJoinRoom() {
    try {
      const { data } = await service.findRoom(this.roomId);
      cookie.set('roomConfig', data, { expires: 1 });
    } catch (e) {
      this.$plugin.toast((e as any).message);
      console.log(e);
    }
  }

  private async created() {
    try {
      await this.autoJoinRoom();
      this.socketInit();
      if (!this.sitLink) {
        this.initSitLink();
      }
    } catch (e) {
      console.log(e);
    }
    // document.addEventListener('visibilitychange', () => {
    //   if (!document.hidden) {
    //     this.socketInit();
    //   }
    // });
  }
}
</script>

<style lang="less" scoped>
.game-container {
  background: radial-gradient(#00bf86, #006a55);
  background-size: 100% 100%;
  height: calc(100% - 45px);
  width: 100vw;
  overflow: hidden;

  .game-canvas {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -110px);
    white-space: nowrap;

    .action-notice {
      position: absolute;
      bottom: 100%;
      font-size: 16px;
      font-weight: bold;
      color: #cc0202;
      margin-bottom: 1em;
    }

    .game-body {
      z-index: 0;

      .roomId {
        margin-top: 10px;
        font-size: 14px;
      }
    }

    @media (min-width: 800px) and (min-height: 800px) {
      transform: translate(-50%, -150px);

      .action-notice {
        font-size: 24px;
      }

      .common-cards /deep/ .card-container {
        transform: scale(1.5);
      }
    }
  }

  .common-cards {
    margin-top: 30px;
  }

  .winner-poke-style {
    margin-top: 20px;
    font-size: 14px;
    color: #fff;
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
      transition: transform 0.5s;

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
  .game-record {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 36px;
    color: #fff;
  }
}
</style>
