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
  pokerStyle: string = '';

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
   * @param {string} commandString - player action command string
   * @param {number} prevSize - prev player action size
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
      this.actionCommand = (command === ECommand.SMALL_BLIND || command === ECommand.BIG_BLIND) ? '' : command;
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
    if (this.actionCommand !== 'fold') {
      this.actionCommand = '';
    }
  }

  setIncome(size: number) {
    console.log('size', size);
    this.income = size;
    this.counter += size;
  }
}
