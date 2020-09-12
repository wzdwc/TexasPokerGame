import BaseService from '../lib/baseService';
import { Context, inject, provide, plugin, config } from 'midway';
import { IAccountInfo } from '../interface/IAccountInfo';
import { IAccountService } from '../interface/service/IAccountService';
import { ILoginResult } from '../interface/ILoginResult';
import { IUserService } from '../interface/service/IUserService';
import { IUser } from '../interface/IUser';

@provide('AccountService')
export class AccountService extends BaseService implements IAccountService {

  @inject()
  ctx: Context;

  @plugin()
  jwt: any;

  @inject('UserService')
  user: IUserService;

  @config('jwt')
  protected jwtConfig: any;

  public login(accountInfo: IAccountInfo): Promise<ILoginResult> {
    return new Promise(async (resolve, reject) => {
      try {
        let token = '';
        // 校验用户信息
        const isAuth = await this.authUser(accountInfo);
        if (isAuth) {
          token = await this.getToken(accountInfo.userAccount);
        }
        const result: ILoginResult = { token };
        resolve(result);
      } catch (e) {
        this.ctx.logger.error('login service error:', e);
        reject(e);
      }
    });
  }

  public async register(accountInfo: IAccountInfo): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const hasUser = await this.checkHasUser(accountInfo.userAccount);
        console.log('accountInfo', hasUser, accountInfo);
        if (!hasUser) {
          const result = await this.user.addUser(accountInfo);
          if (result.succeed) {
            resolve('user create successful');
          }
        } else {
          reject('User already exists');
        }
      } catch (e) {
        this.ctx.logger.error('register service error:', e);
        reject(e);
      }
    });
  }

  public async authUser(accountInfo: IAccountInfo) {
    const user: IUser = await this.checkHasUser(accountInfo.userAccount);
    const valid = user.password === accountInfo.password;
    if (!valid) {
      throw 'incorrect user account or password.';
    }
    return valid;
  }

  private async checkHasUser(userAccount: string): Promise<IUser> {
    return await this.user.findByAccount(userAccount);
  }

  private async getToken(userAccount: string) {
    const { nickName, account, id } = await this.user.findByAccount(userAccount);
    const token = this.jwt.sign({
          user: {
           nickName,
           account,
           userId: id,
          },
        },
    this.jwtConfig.secret, { expiresIn: 60 * 60 * 6 });
    this.ctx.logger.info(`AccountService getToken token--${token}`);
    return token;
  }
}
