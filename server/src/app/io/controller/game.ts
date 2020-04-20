'use strict';

import BaseSocketController from '../../../lib/baseSocketController';
import { IRoomInfo } from '../../../interface/IGameRoom';
import { PokerGame } from '../../core/PokerGame';
import { IPlayer } from '../../core/Player';

class GameController extends BaseSocketController {

  async playGame() {
    const { room } = this.socket.handshake.query;
    console.log('play------------', room);
    console.log('socket------------', this.socket.id);
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
      if (!roomInfo.game) {
        roomInfo.game = new PokerGame({
          users: roomInfo.players,
          smallBlind: 1,
          updateCommonCard: () => {
            console.log('send common card');
            this.nsp.adapter.clients([ this.roomNumber ], (err: any, clients: any) => {
                if (roomInfo.game) {
                  // 广播信息
                  this.nsp.to(this.roomNumber).emit('online', {
                    clients,
                    action: 'commonCard',
                    target: 'participator',
                    message: JSON.stringify(roomInfo.game.commonCard),
                  });
                }
              });
          },
        });
        roomInfo.game.play();
        console.log('hand card', roomInfo.game.allPlayer);
        roomInfo.players.forEach(p => {
          if (roomInfo.game) {
            // console.log('game msg---------1');
            const player = roomInfo.game.allPlayer.find(player => player.socketId === p.socketId);
            // console.log(player, 'game msg---------1');
            if (player) {
              const msg = this.ctx.helper.parseMsg('handCard', {
                handCard: player.handCard,
              }, { client: p.socketId });
              console.log(msg, 'game msg---------', p.socketId);
              this.nsp.emit(p.socketId, msg);
            }
          }
        });
      } else {
        throw 'game already paling';
      }
    } catch (error) {
      this.app.logger.error(error);
    }
  }

  async buyIn() {
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
      this.nsp.adapter.clients([ this.roomNumber ], (err: any, clients: any) => {
        // 广播信息
        this.nsp.to(this.roomNumber).emit('online', {
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

  async handCard() {
    try {
      const userInfo: IPlayer = await this.getUserInfo();
      const roomInfo: IRoomInfo = await this.getRoomInfo();
      const player = roomInfo.players.find((p: IPlayer) => p.nick_name === userInfo.nick_name);
      console.log(userInfo, 'userInfo------');
      if (player && roomInfo.game) {
        const gamePlayer = roomInfo.game.allPlayer.find(p => player.socketId === p.socketId);
        if (gamePlayer) {
          const msg = this.ctx.helper.parseMsg('handCard', {
            handCard: gamePlayer.handCard,
          }, { client: player.socketId });
          console.log(msg, 'game msg---------');
          this.nsp.emit(player.socketId, msg);
        }
      } else {
        throw 'game over';
      }
    } catch (e) {
      console.log(e);
    }
  }

  async action() {
    try {
      const { payload } = this.message;
      const userInfo: IPlayer = await this.getUserInfo();
      const roomInfo = await this.getRoomInfo();
      if (roomInfo.game && roomInfo.game.currPlayer.node.userId === userInfo.userId) {
        roomInfo.game.action(payload.command);
        // todo notice next player action
      } else {
        throw 'action flow incorrect';
      }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = GameController;
