import { Controller } from 'egg';
import { IGameRoom, IRoomInfo } from '../interface/IGameRoom';
import { IPlayer } from '../app/core/Player';

export default class BaseSocketController extends Controller {

  public app = this.ctx.app as any;
  public nsp = this.app.io.of('/socket');
  public gameRooms = this.nsp.gameRooms;
  public socket = this.ctx.socket as any;
  public query = this.socket.handshake.query;
  public roomNumber = this.query.room;
  public jwt: any = this.app.jwt;
  public message = this.ctx.args[0] || {};

  async getUserInfo() {
    const { token } = this.query;
    const user: IPlayer = this.jwt.verify(token) && this.jwt.verify(token).user;
    return user;
  }

  async getRoomInfo(): Promise<IRoomInfo> {
    const { room } = this.query;
    const roomInfo = this.gameRooms.find((gr: IGameRoom) => gr.number === room);
    return roomInfo.roomInfo;
  }

  async updateGameInfo() {
    const roomInfo = await this.getRoomInfo();
    this.nsp.adapter.clients([ this.roomNumber ], (err: any, clients: any) => {
      if (roomInfo.game && roomInfo.game.status < 6) {
        roomInfo.players.forEach(p => {
          const currPlayer = roomInfo.game &&
            roomInfo.game.allPlayer.find(player => player.userId === p.userId);
          p.counter = currPlayer && currPlayer.counter || 0;
        });
        const gameInfo = {
          players: roomInfo.game.allPlayer.map(p => Object.assign({}, {
            counter: p.counter,
            actionSize: p.actionSize,
            nickName: p.nickName,
            type: p.type,
            userId: p.userId,
          }, {})),
          pot: roomInfo.game.pot,
          prevSize: roomInfo.game.prevSize,
          currPlayer: {
            userId: roomInfo.game.currPlayer.node.userId,
          },
        };
        // 广播信息
        this.nsp.to(this.roomNumber).emit('online', {
          clients,
          action: 'gameInfo',
          target: 'participator',
          data: gameInfo,
        });
      }
    });
  }
}
