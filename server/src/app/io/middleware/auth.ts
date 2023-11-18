import { Context } from "@midwayjs/web";
import { ITickMsg } from "../../../interface/ITickMsg";

export default function auth(): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    const socket = ctx.socket as any;
    const id = socket.id;
    const app = ctx.app as any;
    const nsp = app.io.of("/socket");
    const query = socket.handshake.query;
    // 用户信息
    const { room, token } = query;
    function tick(id: number, msg: ITickMsg, nsp: any, socket: any) {
      // 踢出用户前发送消息
      socket.emit(id, ctx.helper.parseMsg("deny", msg));
      // 调用 adapter 方法踢出用户，客户端触发 disconnect 事件
      nsp.adapter.remoteDisconnect(id, true, (err: any) => {
        ctx.logger.error("room service tick", err);
      });
    }

    function leave() {}
    try {
      await app.jwt.verify(token);
      // const { nick_name: userName } = userInfo.user;

      // 检查房间是否存在，不存在则踢出用户
      const roomService = await app.applicationContext.getAsync("RoomService");
      const hasRoom = await roomService.findByRoomNumber(room);
      if (!hasRoom) {
        tick(
          id,
          {
            type: "deleted",
            message: "deleted, room has been deleted.",
          },
          nsp,
          socket
        );
        return;
      }
      console.log("play------------", room);
      await next();
      leave();
    } catch (e) {
      console.log(e);
      tick(
        id,
        {
          type: "deleted",
          message: "deleted, room has been deleted.",
        },
        nsp,
        socket
      );
    }
  };
}
