import { Inject, Controller, Post, Provide, Plugin } from '@midwayjs/core';
import { Context } from '@midwayjs/web';
import BaseController from '../../lib/baseController';
import { IUserService } from '../../interface/service/IUserService';

@Provide()
@Controller('/node/user')
export class UserController extends BaseController {
  @Inject()
  ctx: Context;

  @Plugin()
  jwt: any;

  @Inject('UserService')
  user: IUserService;

  /**
   * 处理ocr数据转发
   */
  @Post('/')
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
