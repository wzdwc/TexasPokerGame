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
   * 处理ocr数据转发
   */
  @post('/')
  async index() {
    try {
      const result = await this.roomService.add();
      if(result.affectedRows === 1) {
        this.success({ username: 'cai'});
      } else {
        this.fail('create room error');
      }
    } catch (e) {
      this.fail('create room error');
      console.log(e)
    }
  }
}
