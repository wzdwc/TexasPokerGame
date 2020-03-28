import BaseController from "../../lib/baseController";
import {controller, inject, post, provide} from "midway";
import {IAccountService} from '../../interface/IAccountService'
import {IAccountInfo} from "../../interface/IAccountInfo";

@provide()
@controller('/node/user/')
export class Account extends BaseController {

  @inject('AccountService')
  service: IAccountService;

  @post('/login')
  async login() {
    try {
      const { body } = this.getRequestBody();
      const { userAccount, password } = body;
      const accountInfo: IAccountInfo = {userAccount, password};
      const result = await this.service.login(accountInfo);
      this.success(result)
    } catch (e) {
      this.ctx.logger.error('login-----:', e);
      this.fail(e)
    }
  }
}
