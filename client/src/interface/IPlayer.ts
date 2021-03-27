enum PlayerType {
  READY,
  SIT_DOWN,
  GAMING,
}

export interface IPlayer {
  counter: number;
  nickName: string;
  actionSize: number;
  actionCommand: string;
  type: string;
  userId?: string;
  handCard?: string[];
  buyIn: number;
  status: number;
  income?: number;
  isSit: boolean;
  delayCount: number;
}
