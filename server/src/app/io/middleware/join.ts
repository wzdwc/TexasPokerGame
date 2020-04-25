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
    const { room, token } = query;
    console.log('socket-----join', id);
    // room缓存信息是否存在
    if (!nsp.gameRooms) {
      nsp.gameRooms = [];
    }
    try {
      const hasRoom = nsp.gameRooms.find((r: IGameRoom) => r.number === room);
      const { user } = await app.jwt.verify(token);
      const player = {
        ...user,
        socketId: id,
        counter: 0,
        buyIn: 0,
      };
      let gameRoom: IGameRoom = {
        number: room,
        roomInfo: {
          players: [],
          game: null,
        },
      };
      if (!hasRoom) {
        nsp.gameRooms.push(gameRoom);
        gameRoom.roomInfo = {
          players: [ player ],
          game: null,
        };
      } else {
        gameRoom = nsp.gameRooms.find((r: IGameRoom) => r.number === room);
        const findPlayer = gameRoom.roomInfo.players.find((p: IPlayer) => p.account === user.account);
        if (!findPlayer) {
          gameRoom.roomInfo.players.push(player);
        } else {
          findPlayer.socketId = id;
          // in the game, update hand cards
          const gamePlayer = gameRoom.roomInfo.game?.allPlayer.find(p => user.userId === p.userId);
          if (gamePlayer) {
            const msg = ctx.helper.parseMsg('handCard', {
              handCard: gamePlayer.getHandCard(),
            }, { client: id });
            socket.emit(id, msg);
          }
        }
      }
      socket.join(room);
      socket.emit(id, ctx.helper.parseMsg('userInfo', user));

      // console.log('players', JSON.stringify(gameRoom.roomInfo.players));
      updatePlayer(room, `User(${user.nickName}) joined.`, 'join', nsp);
      updatePlayer(room, gameRoom.roomInfo.players, 'players', nsp);
      await next();
    } catch (e) {
      throw e;
    }
  };
}
