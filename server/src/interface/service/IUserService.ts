import { IAccountInfo } from '../IAccountInfo';
import { IUser } from '../IUser';

export interface IUserService {
  findById(uid: string): Promise<IUser>;
  findByAccount(account: string): Promise<IUser>;
  addUser(accountInfo: IAccountInfo): Promise<any>;
}
