import BaseService from '../lib/baseService';
import {Context, inject, provide, plugin, config} from "midway";
import {IAccountInfo} from "../interface/IAccountInfo";
import {IAccountService} from "../interface/IAccountService";
import {ILoginResult} from "../interface/ILoginResult";

@provide('AccountService')
export class AccountService extends BaseService implements IAccountService {

  @inject()
  ctx: Context;

  @plugin()
  jwt: any;

  @config('jwt')
  protected jwtConfig: any;

  public login(accountInfo: IAccountInfo): Promise<ILoginResult> {
    return new Promise(async (resolve, reject) => {
      try {
        let token = '';
        // 校验用户信息
        const isAuth = await this.authUser(accountInfo);
        if (isAuth) {
          token = await this.getToken(accountInfo.userAccount)
        }
        const result: ILoginResult = {token};
        resolve(result)
      } catch (e) {
        this.ctx.logger.error('login service error:', e);
        reject(e);
      }
    })
  }

  public async authUser(accountInfo: IAccountInfo) {
    let valid = accountInfo.userAccount === 'cai' && accountInfo.password === '123';
    if (!valid) {
      throw 'incorrect user account or password.'
    }
    return accountInfo.userAccount === 'cai' && accountInfo.password === '123';
  }

  private getToken(userAccount: string) {
    const token = this.jwt.sign({userName: userAccount}, this.jwtConfig.secret, { expiresIn: 60 * 60 });
    this.ctx.logger.info(`AccountService getToken token--${token}`);
    return token;
  }
}
