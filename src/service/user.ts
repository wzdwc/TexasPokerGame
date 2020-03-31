import {Context, inject, provide, plugin} from "midway";
import { IUser } from '../interface/IUser';

@provide('UserService')
export class UserService {

  @inject()
  ctx: Context;

  @plugin()
  mysql: any;

  async findById(uid: string){
    const user = await this.mysql.get('user', { id: uid});
    return { user }
  }

  async findByAccount(account: string){
    const user = await this.mysql.get('user', { account: account});
    return { user }
  }

  async addUser(data: IUser) {
    const result = await this.mysql.insert('user', data)
    return result
  }

}
