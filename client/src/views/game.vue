<template>
  <div class="game-container container">
    <div class="game-player-info">
      <div class="users">
        <span v-for="user in users"> {{user.nick_name}}: {{user.counter}}</span>
      </div>
      <div class="join">
        {{joinMsg}}
      </div>
    </div>
    <div class="game-body">
      <div class="common-card">commonCard:{{commonCardString}}</div>
      <div class="hand-card">handCard:{{handCardString}}</div>
      <div class="btn play"><span @click="play">play game</span></div>
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
  import service from '../service';

  interface IUser {
    counter: number;
    nick_name: string;
  }

  interface IMsg {
    action: string;
    clients: string[];
    target: string;
    message: string;
  }

  @Component
  export default class Game extends Vue {
    public socket: any = null;
    private users: IUser[] = [];
    private joinMsg = '';
    private handCard = [];
    private commonCard = [];
    private buyInSize = 0;

    get roomId() {
      return this.$route.params.roomNumber;
    }

    get commonCardString() {
      const cardNumber = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
      const color = ['♦', '♣', '♥', '♠'];
      return this.commonCard.map((c: string) => {
        const cNumber = c.charCodeAt(0) - 97;
        const cColor = Number(c[1]) - 1;
        return `${cardNumber[cNumber]}${color[cColor]}`;
      });
    }

    get handCardString() {
      const cardNumber = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
      const color = ['♦', '♣', '♥', '♠'];
      return this.handCard.map((c: string) => {
        const cNumber = c.charCodeAt(0) - 97;
        const cColor = Number(c[1]) - 1;
        return `${cardNumber[cNumber]}${color[cColor]}`;
      });
    }

    private socketInit() {
      const token = cookie.get('token');
      const log = console.log;
      this.socket = io('http://127.0.0.1:7001/socket', {
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
        });
      });

      // 接收在线用户信息
      this.socket.on('online', (msg: IMsg) => {
        log('#online,', msg);
        if (msg.action === 'join') {
          this.joinMsg = msg.message;
        }
        if (msg.action === 'players') {
          this.users = JSON.parse(msg.message);
          console.log('users', JSON.parse(msg.message));
        }
        if (msg.action === 'commonCard') {
          this.commonCard = JSON.parse(msg.message);
          console.log('users', JSON.parse(msg.message));
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
  }
</style>
