'use strict';

import { Controller } from 'egg';

class NspController extends Controller {
  async exchange() {
    const { ctx } = this;
    const socket = ctx.socket as any;
    const app = ctx.app as any;
    const nsp = app.io.of('/socket');
    const message = ctx.args[0] || {};
    const client = socket.id;
    try {
      const { target, payload } = message;
      if (!target) return;
      const msg = ctx.helper.parseMsg('exchange', payload, { client, target });
      nsp.emit(target, msg);
    } catch (error) {
      app.logger.error(error);
    }
  }

  async broadcast() {
    const { ctx } = this;
    const socket = ctx.socket as any;
    const app = ctx.app as any;
    const nsp = app.io.of('/socket');
    const message = ctx.args[0] || {};
    const { room } = socket.handshake.query;
    const rooms = [ room ];
    try {
      const { payload } = message;
      nsp.adapter.clients(rooms, (err: any, clients: any) => {
        // 广播信息
        nsp.to(room).emit('online', {
          clients,
          action: 'broadcast',
          target: 'participator',
          message: payload,
        });
      });
    } catch (error) {
      app.logger.error(error);
    }
  }
}

module.exports = NspController;
