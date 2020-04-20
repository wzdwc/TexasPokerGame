import { Context } from 'midway';
import { IGameRoom } from '../../../interface/IGameRoom';
import { IPlayer } from '../../core/Player';

export default function join(): any {
  function updatePlayer(roomNumber: string, message: string, action: string, nsp: any) {
    // 在线列表
    nsp.adapter.clients([ roomNumber ], (err: any, clients: any) => {
      // 更新在线用户列表
      nsp.to(roomNumber).emit('online', {
        clients,
        action,
        target: 'participator',
        message,
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
          players: [{
            ...user,
            socketId: id,
            counter: 0,
          }],
          game: null,
        };
      } else {
        gameRoom = nsp.gameRooms.find((r: IGameRoom) => r.number === room);
        const player = gameRoom.roomInfo.players.find((p: IPlayer) => p.account === user.account);
        if (!player) {
          const player = {
            ...user,
            socketId: id,
            counter: 0,
          };
          gameRoom.roomInfo.players.push(player);
        } else {
          player.socketId = id;
        }
      }
      socket.join(room);
      // console.log('players', JSON.stringify(gameRoom.roomInfo.players));
      updatePlayer(room, `User(${user.nick_name}) joined.`, 'join', nsp);
      updatePlayer(room, JSON.stringify(gameRoom.roomInfo.players), 'players', nsp);
      // in the game, update hand cards
      const player = gameRoom.roomInfo.players.find((p: IPlayer) => p.nick_name === user.nick_name);
      if (player && gameRoom.roomInfo.game) {
        const gamePlayer = gameRoom.roomInfo.game.allPlayer.find(p => player.socketId === p.socketId);
        if (gamePlayer) {
          const msg = ctx.helper.parseMsg('handCard', {
            handCard: gamePlayer.handCard,
          }, { client: player.socketId });
          // console.log(msg, 'join: game msg---------2222222');
          socket.emit(id, msg);
        }
      }
      await next();
    } catch (e) {
      throw e;
    }
  };
}
