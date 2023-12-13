import { IPlayer } from '@/interface/IPlayer';

export default interface ISit {
  player: IPlayer | null;
  position: number;
}
