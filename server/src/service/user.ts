import { Inject, Plugin, Provide } from '@midwayjs/core';
import { Context } from '@midwayjs/web';
import { IUser } from '../interface/IUser';
import { IUserService } from '../interface/service/IUserService';
import { IAccountInfo } from '../interface/IAccountInfo';

@Provide('UserService')
export class UserService implements IUserService {
  @Inject()
  ctx: Context;

  @Plugin()
  mysql: any;

  async findById(uid: string): Promise<IUser> {
    const user = await this.mysql.get('user', { id: uid });
    return user;
  }

  async findByAccount(account: string) {
    const user = await this.mysql.get('user', { account });
    return user;
  }

  async addUser(accountInfo: IAccountInfo): Promise<any> {
    const user = await this.mysql.insert('user', {
      account: accountInfo.userAccount,
      password: accountInfo.password,
      nickName: accountInfo.nickName,
    });
    return { succeed: user.affectedRows === 1 };
  }
}
