import { Context, inject, controller, post, provide } from 'midway';
import BaseController from '../../lib/baseController';
import { IRoomService } from '../../interface/IRoom';

@provide()
@controller('/node/game/room')
export class RoomController extends BaseController {

  @inject()
  ctx: Context;

  @inject('RoomService')
  roomService: IRoomService;
  /**
   *
   */
  @post('/')
  async index() {
    try {
      const { body } = this.getRequestBody();
      const result = await this.roomService.add(body.isShort, body.smallBlind);
      this.success(result);
    } catch (e) {
      this.fail('create room error');
      console.log(e);
    }
  }

  @post('/find')
  async find() {
    try {
      const { body } = this.getRequestBody();
      const result = await this.roomService.findRoomNumber(body.roomNumber);
      this.success({ ...result });
    } catch (e) {
      this.fail('invalid room');
      console.log(e);
    }
  }
}
