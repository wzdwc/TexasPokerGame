import { Context, inject, controller, post, provide } from 'midway';
import BaseController from '../../lib/baseController';
import { IRoomService } from '../../interface/IRoom';

@provide()
@controller('/node/game')
export class GameController extends BaseController {

  @inject()
  ctx: Context;

  @inject('GameService')
  gameService: IGameService;
  /**
   *
   */
  @post('/buyIn')
  async buyIn() {
    try {
      const result = await this.gameService.add();
      this.success(result);
    } catch (e) {
      this.fail('create room error');
      console.log(e);
    }
  }
}
