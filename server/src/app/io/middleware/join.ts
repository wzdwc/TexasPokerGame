import { Context } from 'midway';
import { IGameRoom } from '../../../interface/IGameRoom';
import { IPlayer } from '../../core/Player';

export default function join(): any {
  function updatePlayer(roomNumber: string, players: any, action: string, nsp: any) {
    // 在线列表
    nsp.adapter.clients([ roomNumber ], (err: any, clients: any) => {
      // 更新在线用户列表
      nsp.to(roomNumber).emit('online', {
        clients,
        action,
        target: 'participator',
        data: {
          players,
        },
      });
    });
  }
  return async (ctx: Context, next: () => Promise<any>) => {
    const socket = ctx.socket as any;
    const id = socket.id;
    const app = ctx.app as any;
    const nsp = app.io.of('/socket');
    const query = socket.handshake.query;
    const { room, token, roomConfig } = query;
    console.log('socket-----join', id);
    console.log('roomConfig-----roomConfig', JSON.parse(roomConfig));
    // room缓存信息是否存在
    if (!nsp.gameRooms) {
      nsp.gameRooms = [];
    }
    try {
      const hasRoom = nsp.gameRooms.find((r: IGameRoom) => r.number === room);
      const { user } = await app.jwt.verify(token);
      socket.join(room);
      await socket.emit(id, ctx.helper.parseMsg('userInfo', { userInfo: user }));
      const player: IPlayer = {
        ...user,
        socketId: id,
        counter: 0,
        buyIn: 0,
        delayCount: 3,
        reBuy: 0,
      };
      let gameRoom: IGameRoom = {
        number: room,
        roomInfo: {
          sit: [],
          players: [],
          game: null,
          sitLink: null,
          config: JSON.parse(roomConfig) || {
            isShort: false,
            smallBlind: 1,
          },
        },
      };
      if (!hasRoom) {
        // not in the room
        nsp.gameRooms.push(gameRoom);
        gameRoom.roomInfo = {
          sit: [],
          players: [ player ],
          game: null,
          sitLink: null,
          config: JSON.parse(roomConfig) || {
            isShort: false,
            smallBlind: 1,
          },
        };
        updatePlayer(room, gameRoom.roomInfo.players, 'players', nsp);
      } else {
        // in the room
        gameRoom = nsp.gameRooms.find((r: IGameRoom) => r.number === room);
        const findPlayer = gameRoom.roomInfo.players.find((p: IPlayer) => p.userId === user.userId);
        if (!findPlayer) {
          // game ready
          gameRoom.roomInfo.players.push(player);
          updatePlayer(room, gameRoom.roomInfo.players, 'players', nsp);
        } else {
          // gaming, update hand cards
          findPlayer.socketId = id;
          const gamePlayer = gameRoom.roomInfo.game?.allPlayer.find(p => user.userId === p.userId);
          if (gamePlayer) {
            // in the game, get hand card
            const msg = ctx.helper.parseMsg('handCard', {
              handCard: gamePlayer.getHandCard(),
            }, { client: id });
            socket.emit(id, msg);
          }
          if (gameRoom.roomInfo) {
            const roomInfo = gameRoom.roomInfo;
            const gameInfo = {
              players: roomInfo.players.map(p => {
                const currPlayer = roomInfo.game?.allPlayer.find(player => player.userId === p.userId);
                console.log('currPlayer ========== ', currPlayer);
                return Object.assign({}, {
                  counter: currPlayer?.counter || p.counter,
                  actionSize: currPlayer?.actionSize || 0,
                  actionCommand: currPlayer?.actionCommand || '',
                  nickName: p.nickName,
                  type: currPlayer?.type || '',
                  userId: p.userId,
                  status: p.status,
                  buyIn: p.buyIn || 0,
                }, {});
              }),
              commonCard: roomInfo.game?.commonCard || [],
              pot: roomInfo.game?.pot || 0,
              prevSize: roomInfo.game?.prevSize || 0,
              currPlayer: {
                userId: roomInfo.game?.currPlayer.node.userId,
              },
              smallBlind: roomInfo.config.smallBlind,
              actionEndTime: roomInfo.game?.actionEndTime || 0,
            };
            const game = ctx.helper.parseMsg('gameInfo', {
              data: gameInfo,
            }, { client: id });
            socket.emit(id, game);
          }
        }
        // get sitList
        const msg = ctx.helper.parseMsg('sitList', {
          sitList: gameRoom.roomInfo.sit,
        }, { client: id });
        socket.emit(id, msg);
      }
      // console.log('players', JSON.stringify(gameRoom.roomInfo.players));
      updatePlayer(room, `User(${user.nickName}) joined.`, 'join', nsp);
      await next();
    } catch (e) {
      throw e;
    }
  };
}
