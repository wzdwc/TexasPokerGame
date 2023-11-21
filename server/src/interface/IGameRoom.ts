import { PokerGame } from '../app/core/PokerGame';
import { IPlayer } from '../app/core/Player';
import { ILinkNode } from '../utils/Link';

export interface IGameRoom {
  number: string;
  roomInfo: IRoomInfo;
}

export interface ISit {
  player?: IPlayer;
  position: number;
}

export interface IRoomConfig {
  isShort: boolean;
  smallBlind: number;
  time?: number;
}

export interface IRoomInfo {
  players: IPlayer[];
  sit: ISit[];
  game: PokerGame | null;
  sitLink: ILinkNode<IPlayer> | null;
  gameId?: number;
  config: IRoomConfig;
}
