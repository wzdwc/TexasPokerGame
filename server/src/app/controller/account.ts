import BaseController from "../../lib/baseController";
import { Controller, Inject, Post, Provide } from "@midwayjs/core";
import { IAccountService } from "../../interface/service/IAccountService";
import { IAccountInfo } from "../../interface/IAccountInfo";

@Provide()
@Controller("/node/user/")
export class Account extends BaseController {
  @Inject("AccountService")
  service: IAccountService;

  @Post("/login")
  async login() {
    try {
      const { body } = this.getRequestBody();
      console.log(body, "body");
      const { userAccount, password } = body;
      console.log(userAccount, "userAccount");
      const accountInfo: IAccountInfo = { userAccount, password };
      const result = await this.service.login(accountInfo);
      this.success(result);
    } catch (e: any) {
      this.ctx.logger.error("login-----:", e);
      this.fail(e);
    }
  }

  @Post("/register")
  async register() {
    try {
      const { body } = this.getRequestBody();
      console.log(body);
      const { userAccount, password, nickName } = body;
      const accountInfo: IAccountInfo = { userAccount, password, nickName };
      const result = await this.service.register(accountInfo);
      this.success(result);
    } catch (e: any) {
      this.ctx.logger.error("login-----:", e);
      this.fail(e);
    }
  }
}
