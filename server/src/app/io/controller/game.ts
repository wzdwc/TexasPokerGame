'use strict';

import { Controller } from 'egg';

class GameController extends Controller {
  async play() {
    const { ctx } = this;
    const socket = ctx.socket as any;
    const app = ctx.app as any;
    const nsp = app.io.of('/socket');
    const { room } = socket.handshake.query;
    console.log(room);
    try {
      nsp.adapter.clients([ room ], (err: any, clients: any) => {
        // 广播信息
        nsp.to(room).emit('game', {
          clients,
          action: 'broadcast',
          target: 'participator',
          message: '',
        });
      });
    } catch (error) {
      app.logger.error(error);
    }
  }
}

module.exports = GameController;
