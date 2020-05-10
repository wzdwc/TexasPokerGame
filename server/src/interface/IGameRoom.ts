import { PokerGame } from '../app/core/PokerGame';
import { IPlayer } from '../app/core/Player';

export interface IGameRoom {
  number: string;
  roomInfo: IRoomInfo;
}

export interface ISit {
  player: IPlayer;
  position: number;
}

export interface IRoomInfo {
  players: IPlayer[];
  sit: ISit[];
  game: PokerGame | null;
}
