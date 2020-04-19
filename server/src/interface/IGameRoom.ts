import { PokerGame } from '../app/core/PokerGame';
import { IPlayer } from '../app/core/Player';

export interface IGameRoom {
  number: string;
  roomInfo: IRoomInfo;
}
export interface IRoomInfo {
  players: IPlayer[];
  game: PokerGame | null;
}
