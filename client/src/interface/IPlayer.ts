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
  /** 自愿 action 次数, 不包括 fold, 大小盲 */
  voluntaryActionCount: number;
  /** 总 action 次数, 包括 fold */
  totalActionCount: number;
  vpip: number;
}
