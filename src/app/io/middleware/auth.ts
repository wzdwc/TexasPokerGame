import {Context} from "midway";

const PREFIX = 'room';
export default function auth(): any{
  return async (ctx: Context, next: () => Promise<any>) => {
    const { logger, helper } = ctx;
    const socket = ctx.socket as any;
    const app = ctx.app as any;
    const id = socket.id;
    const nsp = app.io.of('/socket');
    const query = socket.handshake.query;
    // 用户信息
    const { room, userId } = query;
    const rooms = [ room ];

    console.log('#user_info', id, room, userId);
    const tick = (id: string, msg: object) => {
      console.log('#tick', id, msg);

      // 踢出用户前发送消息
      socket.emit(id, helper.parseMsg('deny', msg));

      // 调用 adapter 方法踢出用户，客户端触发 disconnect 事件
      nsp.adapter.remoteDisconnect(id, true, (err: any) => {
        logger.error(err);
      });
    };

    // 检查房间是否存在，不存在则踢出用户
    // 备注：此处 app.redis 与插件无关，可用其他存储代替
    const hasRoom = await app.redis.get(`${PREFIX}:${room}`);

    console.log('#has_exist', hasRoom);

    if (!hasRoom) {
      tick(id, {
        type: 'deleted',
        message: 'deleted, room has been deleted.',
      });
      return;
    }

    // 用户加入
    console.log('#join', room);
    socket.join(room);

    // 在线列表
    nsp.adapter.clients(rooms, (err: any, clients: any) => {
      console.log('#online_join', clients);

      // 更新在线用户列表
      nsp.to(room).emit('online', {
        clients,
        action: 'join',
        target: 'participator',
        message: `User(${id}) joined.`,
      });
    });

    await next();

    // 用户离开
    console.log('#leave', room);

    // 在线列表
    nsp.adapter.clients(rooms, (err: any, clients: any) => {
      console.log('#online_leave', clients);

      // 获取 client 信息
      // const clientsDetail = {};
      // clients.forEach(client => {
      //   const _client = app.io.sockets.sockets[client];
      //   const _query = _client.handshake.query;
      //   clientsDetail[client] = _query;
      // });

      // 更新在线用户列表
      nsp.to(room).emit('online', {
        clients,
        action: 'leave',
        target: 'participator',
        message: `User(${id}) leaved.`,
      });
    });

  };
}
