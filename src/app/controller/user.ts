import { Context, inject, controller, post, provide } from 'midway';
import BaseController from '../../lib/baseController';

@provide()
@controller('/node/user')
export class UserController extends BaseController {

  @inject()
  ctx: Context;
  /**
   * 处理ocr数据转发
   */
  @post('/')
  async index() {
    try {
      const { body } = this.getRequestBody();
      const token: string = this.ctx.get('Authorization') || '';
      console.log(token, body, this.ctx.state)
      this.success({ username: 'cai'})
    } catch (e) {
      console.log(e)
    }
  }
}
