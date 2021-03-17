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

  protected async getUserInfo() {
    const { token } = this.query;
    const user: IPlayer = this.jwt.verify(token) && this.jwt.verify(token).user;
    return user;
  }

  protected async getRoomInfo(): Promise<IRoomInfo> {
    const { room } = this.query;
    const roomInfo = this.gameRooms.find((gr: IGameRoom) => gr.number === room);
    return roomInfo.roomInfo;
  }

  protected adapter(type: string, actionName: string, data: any) {
    return new Promise(resolve => {
      this.nsp.adapter.clients([ this.roomNumber ], (err: any, clients: any) => {
        this.nsp.to(this.roomNumber).emit(type, {
          clients,
          action: actionName,
          target: 'participator',
          data,
        });
        resolve();
      });
    });
  }

  protected async updateGameInfo() {
    const roomInfo = await this.getRoomInfo();
    console.log(roomInfo, 'roomInfo ===============================');
    if (roomInfo.game && roomInfo.game.status < 6 || (roomInfo.game?.status === 6 && roomInfo.game.playerSize === 1)) {
      roomInfo.players.forEach(p => {
        const currPlayer = roomInfo.game &&
          roomInfo.game.getPlayers().find(player => player.userId === p.userId);
        p.counter = currPlayer?.counter || p.counter;
        p.type = currPlayer?.type || '';
        p.status = currPlayer ? 1 : p.status === -1 ? -1 : 0;
        p.actionCommand = currPlayer && currPlayer.actionCommand || '';
        p.actionSize = currPlayer && currPlayer.actionSize || 0;
      });
      console.log(roomInfo.players,
        'roomInfo.players ===============================333');
      const gameInfo = {
        players: roomInfo.players.map(p => {
          const currPlayer = roomInfo.game?.allPlayer.find(
            player => player.userId === p.userId);
          return Object.assign({}, {
            counter: currPlayer?.counter || p.counter,
            actionSize: currPlayer?.actionSize || 0,
            actionCommand: currPlayer?.actionCommand || '',
            nickName: p.nickName,
            type: currPlayer?.type || '',
            status: p.status || 0,
            userId: p.userId,
            buyIn: p.buyIn || 0,
          }, {});
        }),
        pot: roomInfo.game.pot,
        prevSize: roomInfo.game.prevSize,
        sitList: roomInfo.sit,
        currPlayer: {
          userId: roomInfo.game.currPlayer.node.userId,
        },
        smallBlind: roomInfo.config.smallBlind,
      };
      console.log('gameInfo ==========', gameInfo);
      await this.adapter('online', 'gameInfo', gameInfo);
    }
  }
}
