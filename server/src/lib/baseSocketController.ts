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
}
