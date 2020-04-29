'use strict';
import BaseSocketController from '../../../lib/baseSocketController';
import { IRoomInfo } from '../../../interface/IGameRoom';
import { PokerGame } from '../../core/PokerGame';
import { IPlayer } from '../../core/Player';

class GameController extends BaseSocketController {

  async playGame() {
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
      console.log('players', roomInfo.players);
      const sitDownPlayer = roomInfo.players.filter(p => p.counter > 0 && !!p.sit);

      if (sitDownPlayer.length < 2) {
        throw 'player not enough';
      }

      if (!roomInfo.game) {
        roomInfo.game = new PokerGame({
          users: sitDownPlayer,
          smallBlind: 1,
          updateCommonCard: () => {
            if (roomInfo.game) {
              console.log('come in', roomInfo.game.status);
              if (roomInfo.game.status < 6) {
                roomInfo.game.sendCard();
                roomInfo.game.startActionRound();
              }
              this.nsp.adapter.clients([ this.roomNumber ],
                (err: any, clients: any) => {
                  if (roomInfo.game) {
                    // 更新common card
                    this.nsp.to(this.roomNumber).emit('online', {
                      clients,
                      action: 'commonCard',
                      target: 'participator',
                      data: {
                        commonCard: roomInfo.game.commonCard,
                      },
                    });
                  }
                });
            }
          },
          gameOverCallBack: () => {
            if (roomInfo.game) {
              // game over
              roomInfo.game.allPlayer.forEach(gamePlayer => {
                const player = roomInfo.players.find(
                  (p: IPlayer) => p.nickName === gamePlayer.nickName);
                if (player) {
                  player.counter = gamePlayer.counter;
                }
              });
              console.log('game over-------------');
              console.log(roomInfo.game.commonCard);
              console.log(roomInfo.game.pot);
              console.log(roomInfo.players, '=============players');
              console.log(roomInfo.game.getPlayers());
              console.log(roomInfo.game.winner);
              // new game
              setTimeout(() => {
               this.reStart();
              }, 100000);
            }
            this.nsp.adapter.clients([ this.roomNumber ],
              (err: any, clients: any) => {
                if (roomInfo.game) {
                  // game over show winner
                  if (roomInfo.game.status === 7) {
                    let winner: any = [[{ ...roomInfo.game.winner[0][0], handCard: [] }]];
                    let allPlayers = winner[0];
                    // only player, other fold
                    if (roomInfo.game.getPlayers().length !== 1) {
                      winner = roomInfo.game.winner;
                      allPlayers = roomInfo.game.getPlayers();
                    }
                    this.nsp.to(this.roomNumber).emit('online', {
                      clients,
                      action: 'gameOver',
                      target: 'participator',
                      data: {
                        winner,
                        allPlayers,
                      },
                    });
                  }
                }
              });
          },
        });
        roomInfo.game.play();
        roomInfo.game.startActionRound();
        console.log('hand card', roomInfo.game.allPlayer);
        // update counter, pot
        await this.updateGameInfo();
        roomInfo.players.forEach(p => {
          // console.log('game msg---------1');
          const player = roomInfo.game?.allPlayer.find(
            player => player.socketId === p.socketId);
          // console.log(player, 'game msg---------1');
          const msg = this.ctx.helper.parseMsg('handCard', {
            handCard: player?.getHandCard(),
          }, { client: p.socketId });
          console.log(msg, 'game msg---------', p.socketId);
          this.nsp.emit(p.socketId, msg);
        });
      } else {
        throw 'game already paling';
      }
    } catch (error) {
      this.app.logger.error(error);
    }
  }

  async reStart() {
    const roomInfo: IRoomInfo = await this.getRoomInfo();
    const player = roomInfo.players.shift();
    if (player) {
      roomInfo.players.push(player);
    }
    roomInfo.game = null;
    // update player counter
    roomInfo.players.forEach(p => {
      p.counter += p.reBuy;
      p.reBuy = 0;
    })
    // new game
    this.nsp.adapter.clients([ this.roomNumber ], (err: any, clients: any) => {
      // 广播信息
      this.nsp.to(this.roomNumber).emit('online', {
        clients,
        action: 'newGame',
        target: 'participator',
        data: {},
      });
    });
    await this.playGame();
  }

  async buyIn() {
    try {
      const userInfo: IPlayer = await this.getUserInfo();
      const roomInfo: IRoomInfo = await this.getRoomInfo();
      const { payload } = this.ctx.args[0] || {};
      const { buyInSize } = payload;
      const player = roomInfo.players.find(
        (p: IPlayer) => p.nickName === userInfo.nickName);
      console.log(userInfo, 'userInfo------');
      if (player) {
        if (roomInfo.game) {
          const inTheGame = roomInfo.game.allPlayer.find(p => p.userId === userInfo.userId);
          // player in the game, can't buy in
          if (inTheGame) {
            player.reBuy += Number(buyInSize);
          }
        }
        player.buyIn += Number(buyInSize);
        player.counter += Number(buyInSize);
      } else {
        const player: IPlayer = {
          counter: Number(buyInSize),
          buyIn: Number(buyInSize),
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
          data: {
            players: roomInfo.players,
          },
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
      const player = roomInfo.players.find(
        (p: IPlayer) => p.nickName === userInfo.nickName);
      console.log(userInfo, 'userInfo------');
      if (player && roomInfo.game) {
        const gamePlayer = roomInfo.game.allPlayer.find(
          p => player.socketId === p.socketId);
        if (gamePlayer) {
          const msg = this.ctx.helper.parseMsg('handCard', {
            handCard: gamePlayer.getHandCard(),
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
      console.log('action：', payload.command);
      console.log('action：', roomInfo.game && roomInfo.game.currPlayer.node,
        userInfo);
      if (roomInfo.game && roomInfo.game.currPlayer.node.userId ===
        userInfo.userId) {
        roomInfo.game.action(payload.command);
        // todo notice next player action
        await this.updateGameInfo();
        console.log('curr player', roomInfo.game.currPlayer.node);
      } else {
        throw 'action flow incorrect';
      }
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = GameController;
