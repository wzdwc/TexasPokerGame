import {IAccountInfo} from "./IAccountInfo";
import {ILoginResult} from "./ILoginResult";

export interface IAccountService {
  login(accountInfo: IAccountInfo): Promise<ILoginResult>;
  authUser(userInfo: IAccountInfo): boolean;
}
