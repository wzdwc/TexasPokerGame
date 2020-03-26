import BaseService from '../lib/baseService';
import {Context, inject, provide, Application} from "midway";
import {IAccountInfo} from "../interface/IAccountInfo";
import {IAccountService} from "../interface/IAccountService";
import { sign } from 'jsonwebtoken';
import {ILoginResult} from "../interface/ILoginResult";

@provide('AccountService')
export class AccountService extends BaseService implements IAccountService{

  @inject()
  app: Application;

  @inject()
  ctx: Context;

  salt: 'test123';

  public login(accountInfo: IAccountInfo): Promise<ILoginResult> {
    return new Promise( async (resolve,reject) => {
      try {
        // 校验是否登录
        let token = await this.isLogin(accountInfo);
        if(!token) {
          // 校验用户信息
          const isAuth = await this.authUser(accountInfo)
          if(isAuth){
            token = await this.setToken(accountInfo)
          } else {
            token = ''
          }
        }
        const result:ILoginResult = { token }
        resolve(result)
      } catch (e) {
        reject('auth error');
      }
    })
  }

  private async isLogin(accountInfo: IAccountInfo): Promise<string> {
    try {
      const token: string = await this.getToken(accountInfo.userAccount)
      return token
    } catch (e) {
      throw 'isLogin error'
    }
  }

  public async authUser(accountInfo: IAccountInfo) {
    return accountInfo.userAccount === 'cai' && accountInfo.password === '123'
  }
  private async setToken(accountInfo: IAccountInfo) {
    try {
      let token = sign({userName: accountInfo.userAccount}, this.salt);
      await this.app.redis.set(accountInfo.userAccount, token)
      return token
    } catch (e) {
      throw `redis error: ${e.msg}`
    }
  }

  private getToken(userAccount: string) {
    let token = this.app.redis.get(userAccount);
    console.log('token', token)
    return token
  }
}
