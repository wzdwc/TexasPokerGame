export interface IPlayer {
  counter: number;
  position?: number;
  userId: string;
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

export class Player {
  handCard: string[] = [];
  position: number = 0;
  counter: number = 0;
  userId: string = '';
  actionSize: number;
  evPot: number;

  // commandRecord: Array<string> = [];
  constructor(config: IPlayer = { counter: 0, position: 0, userId: '' }) {
    this.counter = config.counter;
    this.position = config.position;
    this.userId = config.userId;
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
  action(commandString: string, prevSize?: number) {
    const commandArr = commandString.split(':');
    const command = commandArr[0];
    const raiseSize = Number(commandArr[1]);
    let size = 0;
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
        throw 'error action STRADDLE';
      }
    }

    // player raise,get the raise size
    if (command === ECommand.RAISE) {
      // raise must double to prevSize
      if (raiseSize >= prevSize * 2) {
        size = raiseSize;
      } else {
        throw 'error action: raise size too small';
      }
    }

    if (command === ECommand.ALL_IN) {
      size = this.counter;
    }

    if (command === ECommand.CALL) {
      size = prevSize;
    }

    if (command === ECommand.CHECK || command === ECommand.FOLD) {
      size = 0;
    }
    this.counter -= size;
    this.actionSize = size;
    return size;
  }

  clearActionSize() {
    this.actionSize = 0;
  }
}
