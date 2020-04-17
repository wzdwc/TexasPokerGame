import { Context, inject, provide, plugin } from 'midway';
import { IUser } from '../interface/IUser';
import { IUserService } from '../interface/IUserService';
import { IAccountInfo } from '../interface/IAccountInfo';

@provide('UserService')
export class UserService implements IUserService {

  @inject()
  ctx: Context;

  @plugin()
  mysql: any;

  async findById(uid: string): Promise<IUser> {
    return await this.mysql.get('user', { id: uid });
  }

  async findByAccount(account: string) {
    return await this.mysql.get('user', { account });
  }

  async addUser(accountInfo: IAccountInfo): Promise<any> {
    return await this.mysql.insert('user', {
      account: accountInfo.userAccount,
      password: accountInfo.password,
      nick_name: accountInfo.nickName,
    });
  }

}
