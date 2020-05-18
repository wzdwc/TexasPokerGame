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
      nick_name: accountInfo.nickName,
    });
    return { succeed: user.affectedRows === 1 };
  }

}
