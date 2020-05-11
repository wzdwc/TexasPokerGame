import { IUser } from '@/interface/user';

export default interface ISit {
  player: IUser | null;
  position: number;
}
