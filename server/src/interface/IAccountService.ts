import { IAccountInfo } from './IAccountInfo';
import { ILoginResult } from './ILoginResult';

export interface IAccountService {
  login(accountInfo: IAccountInfo): Promise<ILoginResult>;
  authUser(userInfo: IAccountInfo): Promise<boolean>;
  register(accountInfo: IAccountInfo): Promise<string>;
}
