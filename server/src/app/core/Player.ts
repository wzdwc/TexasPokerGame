export interface IPlayer {
  counter: number;
  buyIn: number;
  position?: number;
  userId: string;
  nickName: string;
  account: string;
  socketId: string;
  income?: number;
  reBuy: number;
}

export enum ECommand {
  SMALL_BLIND = 'small_blind',
  BIG_BLIND = 'big_blind',
  STRADDLE = 'straddle',
  CALL = 'call',
  ALL_IN = 'allin',
  RAISE = 'raise',
  CHECK = 'check',
  FOLD = 'fold',
}

export enum EPlayerType {
  DEFAULT = 'default',
  DEALER = 'd',
  BIG_BLIND = 'bb',
  SMALL_BLIND = 'sb',
}

export class Player {
  private handCard: string[] = [];
  position: number = 0;
  counter: number = 0;
  userId: string = '';
  socketId: string = '';
  nickName: string = '';
  actionSize: number = 0;
  actionCommand: string = '';
  type: string = EPlayerType.DEFAULT;
  evPot: number = Infinity;
  inPot: number = 0;
  income: number = 0;
  pokeStyle: string = '';

  // commandRecord: Array<string> = [];
  constructor(config: IPlayer) {
    this.counter = config.counter;
    this.position = config.position || 0;
    this.userId = config.userId;
    this.socketId = config.socketId;
    this.nickName = config.nickName;
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
   * player action
   * @param {string} commandString
   * @param {number} prevSize
   * @example action('command:raise:10')
   */
  action(commandString: string, prevSize: number = 0) {
    const commandArr = commandString.split(':');
    const command = commandArr[0];
    const raiseSize = Number(commandArr[1]);
    let size = 0;
    if ((command !== ECommand.ALL_IN && command !== ECommand.FOLD)
      && (prevSize > (this.counter + this.actionSize) || raiseSize > this.counter)) {
      throw 'player: error action, overflow action size';
    } else {
      this.actionCommand = (command === 'sb' || command === 'bb') ? '' : command;
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
      if ((raiseSize + this.actionSize) >= prevSize * 2) {
        size = raiseSize;
      } else {
        throw 'player: error action: raise size too small';
      }
    }

    if (command === ECommand.ALL_IN) {
      size = this.counter;
    }

    if (command === ECommand.CALL) {
      console.log('player: call----------------', prevSize, this.actionSize);
      size = prevSize - this.actionSize;
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
    this.actionSize += size;
    return size;
  }

  clearActionSize() {
    this.actionSize = 0;
    this.actionCommand = '';
  }

  setIncome(size: number) {
    console.log('size', size);
    this.income = size;
    this.counter += size;
  }
}
