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
      const accountInfo: IAccountInfo = {userAccount: 'cai', password: '123'};
      const result = await this.service.login(accountInfo);
      this.success(result)
    } catch (e) {
      this.fail(e)
    }
  }
}
