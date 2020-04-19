'use strict';

import BaseSocketController from '../../../lib/baseSocketController';
import { IRoomInfo } from '../../../interface/IGameRoom';
import { PokerGame } from '../../core/PokerGame';
import { IPlayer } from '../../core/Player';

class GameController extends BaseSocketController {

  async playGame() {
    const { room } = this.socket.handshake.query;
    console.log('play------------', room);
    try {
      // const gameRecord: IGameRecord = {
      //   game_id: 0,
      //   user_id: 0,
      //   buy_in: 200,
      //   hand_cards: '',
      //   room_number: room,
      // };
      // await this.gameRecordService.add(gameRecord);
      const roomInfo = await this.getRoomInfo();
      roomInfo.game = new PokerGame({
        users: roomInfo.players,
        smallBlind: 1,
      });
      roomInfo.game.play();
      console.log('hand card', roomInfo.game.allPlayer);
      this.nsp.adapter.clients([ room ], (err: any, clients: any) => {
        // 广播信息
        this.nsp.to(room).emit('game', {
          clients,
          action: 'broadcast',
          target: 'participator',
          message: '',
        });
      });
    } catch (error) {
      this.app.logger.error(error);
    }
  }
  async buyIn() {
    const { room } = this.socket.handshake.query;
    try {
      const userInfo: IPlayer = await this.getUserInfo();
      const roomInfo: IRoomInfo = await this.getRoomInfo();
      const { payload } = this.ctx.args[0] || {};
      const { buyInSize } = payload;
      const player = roomInfo.players.find((p: IPlayer) => p.nick_name === userInfo.nick_name);
      console.log(userInfo, 'userInfo------');
      if (player) {
        player.counter = buyInSize;
      } else {
        const player: IPlayer = {
          counter: buyInSize,
          ...userInfo,
        };
        roomInfo.players.push(player);
      }
      this.nsp.adapter.clients([ room ], (err: any, clients: any) => {
        // 广播信息
        this.nsp.to(room).emit('online', {
          clients,
          action: 'players',
          target: 'participator',
          message: JSON.stringify(roomInfo.players),
        });
      });
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = GameController;
