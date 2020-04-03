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
      const token: string = this.ctx.get('Authorization') || '';
      const userInfo = await this.jwt.verify(token);
      const user = this.user.findByAccount(userInfo.userAccount);
      this.success(user);
    } catch (e) {
      console.log(e);
      this.fail('server error');
    }
  }
}
