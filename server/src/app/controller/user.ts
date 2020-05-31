import { Context, inject, controller, post, provide, plugin } from 'midway';
import BaseController from '../../lib/baseController';
import { IUserService } from '../../interface/IUserService';

@provide()
@controller('/node/user')
export class UserController extends BaseController {

  @inject()
  ctx: Context;

  @plugin()
  jwt: any;

  @inject('UserService')
  user: IUserService;
  /**
   * 处理ocr数据转发
   */
  @post('/')
  async index() {
    try {
      const state = this.ctx.state;
      console.log(state, 'state');
      this.success(state.user.user);
    } catch (e) {
      this.fail('server error');
    }
  }
}
