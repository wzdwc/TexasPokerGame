import { Poker } from './Poker';

export interface IPlayer {
  counter: number;
  buyIn: number;
  position?: number;
  userId: string;
  nickName: string;
  account: string;
  socketId: string;
  income?: number;
  type: string;
  reBuy: number;
  status: number;
  actionSize: number;
  actionCommand: string;
  delayCount?: number;
  id?: number;
  /** 翻前自愿 action 次数, 不包括 fold, 大小盲 */
  voluntaryActionCountAtPreFlop: number;
  /** 翻前总 action 次数, 包括 fold */
  totalActionCountAtPreFlop: number;
  vpip: number;
}

export enum ECommand {
  SMALL_BLIND = 'sb',
  BIG_BLIND = 'bb',
  STRADDLE = 'straddle',
  CALL = 'call',
  ALL_IN = 'allin',
  RAISE = 'raise',
  CHECK = 'check',
  FOLD = 'fold',
}

export enum EPlayerType {
  DEFAULT = '',
  DEALER = 'd',
  BIG_BLIND = 'bb',
  SMALL_BLIND = 'sb',
}

// 这个 player 对象， 每一局游戏结束后会重新 new
export class Player {
  private handCard: string[] = [];
  position: number = 0;
  counter: number = 0;
  userId: string = '';
  playerId: number = 0;
  delayCount: number = 3;
  socketId: string = '';
  nickName: string = '';
  actionSize: number = 0;
  actionCommand: string = '';
  type: string = EPlayerType.DEFAULT;
  evPot: number = Infinity;
  inPot: number = 0;
  income: number = 0;
  pokerStyle: string = '';
  // 用来辅助 vpip计算, 代表 preflop 圈, 是不是第一次动作
  isPreFlopFirstAction = true;
  voluntaryActionCountAtPreFlop = 0;
  totalActionCountAtPreFlop = 0;
  vpip = 0;

  constructor(config: IPlayer) {
    this.counter = config.counter;
    this.position = config.position || 0;
    this.userId = config.userId;
    this.socketId = config.socketId;
    this.nickName = config.nickName;
    this.voluntaryActionCountAtPreFlop = config.voluntaryActionCountAtPreFlop || 0;
    this.totalActionCountAtPreFlop = config.totalActionCountAtPreFlop || 0;
    this.vpip = config.vpip || 0;
    if (this.position === 0) {
      this.type = EPlayerType.DEALER;
    }
    if (this.position === 1) {
      this.type = EPlayerType.SMALL_BLIND;
    }
    if (this.position === 2) {
      this.type = EPlayerType.BIG_BLIND;
    }
  }

  setHandCard(card: string) {
    this.handCard.push(card);
  }

  getHandCard() {
    return this.handCard;
  }

  /**
   *
   * @param useEmoji 默认true, 使用 emoji 显示花色
   * - 否则使用英文代表花色, s 黑桃, h 红桃, c 梅花, d 方块
   * @returns
   */
  getFormattedHandCard(useEmoji = true) {
    return Poker.formatCards(this.handCard, useEmoji) || '';
  }

  /**
   * player action
   * @param {string} commandString - player action command string
   * @param {number} prevSize - prev player action size
   * @example action('command:raise:10')
   */
  action(commandString: string, prevSize: number = 0) {
    const commandArr = commandString.split(':');
    const command = commandArr[0];
    const raiseSize = Number(commandArr[1]);
    let size = 0;
    if (
      command !== ECommand.ALL_IN &&
      command !== ECommand.FOLD &&
      (prevSize > this.counter + this.actionSize || raiseSize > this.counter)
    ) {
      throw 'player: error action, overflow action size';
    } else {
      this.actionCommand = command === ECommand.SMALL_BLIND || command === ECommand.BIG_BLIND ? '' : command;
    }

    // BLIND
    if (command === ECommand.SMALL_BLIND || command === ECommand.BIG_BLIND) {
      size = raiseSize;
    }

    // todo STRADDLE
    if (command === ECommand.STRADDLE) {
      // position 0 is dealer
      if (this.position === 3) {
        size = raiseSize;
      } else {
        throw 'player: error action STRADDLE';
      }
    }

    // player raise,get the raise size
    if (command === ECommand.RAISE) {
      // raise must double to prevSize
      if (raiseSize >= prevSize * 2) {
        console.log('player: RAISE----------------', prevSize, this.actionSize);
        const actionSize = this.actionSize >= 0 ? this.actionSize : 0;
        size = raiseSize - actionSize;
      } else {
        throw 'player: error action: raise size too small';
      }
    }

    if (command === ECommand.ALL_IN) {
      console.log('allin================', this.counter);
      size = this.counter;
    }

    if (command === ECommand.CALL) {
      console.log('player: call----------------', prevSize, this.actionSize);
      const actionSize = this.actionSize >= 0 ? this.actionSize : 0;
      size = prevSize - actionSize;
    }

    if (command === ECommand.CHECK) {
      size = -1;
    }

    if (command === ECommand.FOLD) {
      size = 0;
    }
    if (size > 0) {
      this.counter -= size;
      this.inPot += size;
    }
    console.log('allin================', this.counter);
    this.actionSize += size;
    if (command === ECommand.RAISE) {
      this.actionSize = raiseSize;
    } else if (command === ECommand.CALL) {
      this.actionSize = prevSize;
    }
    return size;
  }

  clearActionSize() {
    this.actionSize = 0;
    if (this.actionCommand !== 'fold' && this.actionCommand !== 'allin') {
      this.actionCommand = '';
    }
  }

  setIncome(size: number) {
    console.log('size', size);
    this.income = size;
    this.counter += size;
  }

  /** 计算VPIP, 注意仅在翻前计算
   * - 计算公式为 主动下注次数 / (下注次数-walks 次数)
   * - 下注次数只计算一次
   * - 非大小盲的时候, check, call, raise, allin 都加主动下注次数
   * - 小盲时候, 只有 call, raise, allin 加主动下注次数
   * - 大盲时候, 只有 raise, allin 加主动下注次数
   * - walks 为, 大盲位，所有人 fold，大盲获胜
   * @param command
   * @param commonCardLength
   * @returns
   */
  updateVPIP(command: ECommand, commonCardLength: number) {
    if (commonCardLength !== 0 || !this.isPreFlopFirstAction) return;
    const playerType = this.type as EPlayerType;

    this.totalActionCountAtPreFlop += 1;

    // 非大小盲的时候, check, call, raise, allin 都加主动下注次数
    if (
      ![EPlayerType.SMALL_BLIND, EPlayerType.BIG_BLIND].includes(playerType) &&
      [ECommand.CHECK, ECommand.CALL, ECommand.RAISE, ECommand.ALL_IN].includes(command)
    ) {
      this.voluntaryActionCountAtPreFlop += 1;
    }

    // 小盲时候, 只有 call, raise, allin 加主动下注次数
    if (EPlayerType.SMALL_BLIND === playerType && [ECommand.CALL, ECommand.RAISE, ECommand.ALL_IN].includes(command)) {
      this.voluntaryActionCountAtPreFlop += 1;
    }

    // 大盲时候, 只有 raise, allin 加主动下注次数
    if (EPlayerType.BIG_BLIND === playerType && [ECommand.RAISE, ECommand.ALL_IN].includes(command)) {
      this.voluntaryActionCountAtPreFlop += 1;
    }

    this.vpip =
      this.totalActionCountAtPreFlop === 0 ? 0 : this.voluntaryActionCountAtPreFlop / this.totalActionCountAtPreFlop;
    this.isPreFlopFirstAction = false;
  }
}
