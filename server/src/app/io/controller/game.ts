'use strict';
import BaseSocketController from '../../../lib/baseSocketController';
import { IRoomInfo, ISit } from '../../../interface/IGameRoom';
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
      console.log('players===============sit11111111111', roomInfo.sit);
      // calculate re buy in
      roomInfo.sit.forEach((s: ISit) => {
        if (s.player) {
          if (s.player.counter === 0) {
            delete s.player;
          }
          console.log('roomInfo.players===============', roomInfo.players);
          const player = roomInfo.players.find(p => p.userId === s.player?.userId);
          if (player) {
            s.player.counter += Number(player.reBuy);
            console.log('cal reBuy ===============================', s.player, player.reBuy);
            player.reBuy = 0;
            s.player.reBuy = 0;
          }
        }
      });
      const sitDownPlayer: IPlayer[] = roomInfo.sit.filter(s => s.player && s.player.counter > 0).map(sit => sit.player);
      if (sitDownPlayer.length < 2) {
        throw 'player not enough';
      }

      if (!roomInfo.game) {
        roomInfo.game = null;
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
                console.log('player =================== game over', gamePlayer);
                const player = roomInfo.players.find(
                  (p: IPlayer) => p.userId === gamePlayer.userId);
                const sit = roomInfo.sit.find(
                  (s: ISit) => s.player?.userId === gamePlayer.userId);
                if (player && sit) {
                  player.counter = gamePlayer.counter;
                  sit.player.counter = gamePlayer.counter;
                }
              });
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
                  // new game
                  setTimeout(() => {
                    this.reStart();
                  }, 8000);
                }
              });
          },
        });
        roomInfo.game.play();
        roomInfo.game.startActionRound();
        console.log('hand card', roomInfo.game.allPlayer);
        // update counter, pot, status
        await this.updateGameInfo();
        roomInfo.players.forEach(p => {
          // console.log('game msg---------1');
          const player = roomInfo.game?.allPlayer.find(
            player => player.userId === p.userId);
          console.log(player, 'game msg---------1');
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
    const sit = roomInfo.sit.shift() as ISit;
    let dealer: IPlayer;
    if (sit?.player) {
      roomInfo.sit.push(sit);
    } else {
      // first player is null, find dealer
      for (let i = 0; i < 8; i++) {
        if (roomInfo.sit[i].player && roomInfo.sit[i].player.userId === roomInfo.game?.allPlayer[0].userId) {
          dealer = {
            ...roomInfo.sit[i].player,
          };
          delete roomInfo.sit[i].player;
          sit.player = dealer;
        }
      }
      roomInfo.sit.push(sit);
    }
    roomInfo.game = null;
    // init player status
    roomInfo.players.forEach(p => {
      p.status = 0;
    });

    // new game
    this.nsp.adapter.clients([ this.roomNumber ], async (err: any, clients: any) => {
      // 广播信息
      this.nsp.to(this.roomNumber).emit('online', {
        clients,
        action: 'newGame',
        target: 'participator',
        data: {},
      });
      await this.playGame();
    });
  }

  async buyIn() {
    try {
      const userInfo: IPlayer = await this.getUserInfo();
      const roomInfo: IRoomInfo = await this.getRoomInfo();
      const { payload } = this.ctx.args[0] || {};
      const { buyInSize } = payload;
      const player = roomInfo.players.find(
        (p: IPlayer) => p.userId === userInfo.userId);
      console.log(userInfo, 'userInfo------');
      const isGaming = !!roomInfo.game;
      if (player) {
        if (roomInfo.game) {
          const inTheGame = roomInfo.game.allPlayer.find(p => p.userId === userInfo.userId);
          // player in the game, can't buy in
          if (inTheGame) {
            player.reBuy += Number(buyInSize);
          }
        } else {
          player.buyIn += Number(buyInSize);
          player.counter += Number(buyInSize);
        }
      } else {
        const player: IPlayer = {
          counter: Number(buyInSize),
          buyIn: Number(buyInSize),
          ...userInfo,
        };
        roomInfo.players.push(player);
      }
      if (!isGaming) {
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
      }
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

  async sitDown() {
    try {
      const { payload } = this.message;
      const sitList = payload.sitList;
      const roomInfo = await this.getRoomInfo();
      console.log('sitList===========', sitList);
      // update player isSit
      // roomInfo.players.forEach(p => {
      //   const sit = sitList.find((s: ISit) => s.player?.userId === p.userId);
      //   p.isSit = !!sit;
      // });
      roomInfo.sit = sitList;
      this.nsp.adapter.clients([ this.roomNumber ], (err: any, clients: any) => {
        // 广播信息
        this.nsp.to(this.roomNumber).emit('online', {
          clients,
          action: 'sitList',
          target: 'participator',
          data: {
            sitList,
          },
        });
      });
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
        const commandArr = payload.command.split(':');
        const command = commandArr[0];
        // fold change status: -1
        if (command === 'fold') {
          roomInfo.players.forEach(p => {
            if (p.userId === userInfo.userId) {
              p.status = -1;
            }
          });
        }
        console.log('fold ===============', roomInfo.players, roomInfo.game.allPlayer);
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
