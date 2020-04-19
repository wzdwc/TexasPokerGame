import { Context } from 'midway';
import { ITickMsg } from '../../../interface/ITickMsg';
import { IGameRoom } from '../../../interface/IGameRoom';
import { IPlayer } from '../../core/Player';

export default function auth(): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    const socket = ctx.socket as any;
    const id = socket.id;
    const app = ctx.app as any;
    const nsp = app.io.of('/socket');
    const query = socket.handshake.query;
    // 用户信息
    const { room, token } = query;
    function tick(id: number, msg: ITickMsg, nsp: any, socket: any) {
      // 踢出用户前发送消息
      socket.emit(id, ctx.helper.parseMsg('deny', msg));
      // 调用 adapter 方法踢出用户，客户端触发 disconnect 事件
      nsp.adapter.remoteDisconnect(id, true, (err: any) => {
        ctx.logger.error('room service tick', err);
      });
    }

    function leave() {
    }

    function join(roomNumber: string, user: IPlayer, nsp: any, socket: any) {
      const hasRoom = nsp.gameRoom.find((r: IGameRoom) => r.number === roomNumber);
      let gameRoom: IGameRoom = {
        number: roomNumber,
        roomInfo: {
          players: [],
          game: null,
        },
      };
      if (!hasRoom) {
        nsp.gameRoom.push(gameRoom);
        gameRoom.roomInfo = {
          players: [{
            ...user,
            counter: 0,
          }],
          game: null,
        };
        socket.join(roomNumber);
      } else {
        gameRoom = nsp.gameRoom.find((r: IGameRoom) => r.number === roomNumber);
        const player = gameRoom.roomInfo.players.find((p: IPlayer) => p.account === user.account);
        if (!player) {
          const player = {
              ...user,
              counter: 0,
          };
          gameRoom.roomInfo.players.push(player);
          socket.join(roomNumber);
        }
      }
      console.log('players', JSON.stringify(gameRoom.roomInfo.players));
      updatePlayer(roomNumber, `User(${user.nick_name}) joined.`, 'join', nsp);
      updatePlayer(roomNumber, JSON.stringify(gameRoom.roomInfo.players), 'players', nsp);
    }

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

    try {
      // room缓存信息是否存在
      if (!nsp.gameRoom) {
        nsp.gameRoom = [];
      }
      const userInfo = await app.jwt.verify(token);
      // const { nick_name: userName } = userInfo.user;

      // 检查房间是否存在，不存在则踢出用户
      const roomService = await app.applicationContext.getAsync('RoomService');
      const hasRoom = await roomService.findByRoomNumber(room);
      if (!hasRoom) {
        tick(id, {
          type: 'deleted',
          message: 'deleted, room has been deleted.',
        }, nsp, socket);
        return;
      }
      join(room, userInfo.user, nsp, socket);
      console.log('play------------', room);
      await next();
      leave();
    } catch (e) {
      console.log(e);
      tick(id, {
        type: 'deleted',
        message: 'deleted, room has been deleted.',
      }, nsp, socket);
    }
  };
}
