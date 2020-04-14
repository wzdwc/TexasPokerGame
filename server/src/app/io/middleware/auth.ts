import { Context } from 'midway';
import { ITickMsg } from '../../../interface/ITickMsg';

export default function auth(): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    const socket = ctx.socket as any;
    const id = socket.id;
    const app = ctx.app as any;
    const nsp = app.io.of('/socket');
    const roomService = await app.applicationContext.getAsync('RoomService');
    const query = socket.handshake.query;
    // 用户信息
    const { room, userName } = query;

    // 检查房间是否存在，不存在则踢出用户
    // 备注：此处 app.redis 与插件无关，可用其他存储代替
    const hasRoom = await roomService.findByRoomNumber(room);
    function tick(id: number, msg: ITickMsg, nsp: any, socket: any) {
      // 踢出用户前发送消息
      socket.emit(id, ctx.helper.parseMsg('deny', msg));
      // 调用 adapter 方法踢出用户，客户端触发 disconnect 事件
      nsp.adapter.remoteDisconnect(id, true, (err: any) => {
        ctx.logger.error('room service tick', err);
      });
    }

    function join(roomNumber: string, userName: string, nsp: any, socket: any) {
      socket.join(roomNumber);
      updatePlayer(roomNumber, `User(${userName}) joined.`, nsp);
    }

    function updatePlayer(roomNumber: string, message: string, nsp: any) {
      // 在线列表
      nsp.adapter.clients([ roomNumber ], (err: any, clients: any) => {
        // 更新在线用户列表
        nsp.to(roomNumber).emit('online', {
          clients,
          action: 'join',
          target: 'participator',
          message,
        });
      });
    }
    if (!hasRoom) {
      tick(id, {
        type: 'deleted',
        message: 'deleted, room has been deleted.',
      }, nsp, socket);
      return;
    }
    join(room, userName, nsp, socket);
    await next();
    updatePlayer(room, userName, nsp);
  };
}
