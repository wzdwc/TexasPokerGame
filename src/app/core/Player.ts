export interface IPlayer {
  counter: number;
  position: number;
  userName: string;
}

enum ECommand {
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

  // commandRecord: Array<string> = [];
  constructor(config: IPlayer = { counter: 0, position: 0, userName: '' }) {
    this.counter = config.counter;
    this.position = config.position;
  }

  /**
   * player action
   * @param {string} commandString
   * @param {number} prevSize
   * @example action('command:raise:10')
   */
  action(commandString: string, prevSize: number) {
    const commandArr = commandString.split(':');
    const command = commandArr[1];
    let size = 0;
    // player raise,get the raise size
    if (command === ECommand.RAISE) {
      size = Number(command[2]);
      this.counter -= size;
    }

    if (command === ECommand.ALL_IN) {
      size = this.counter;
      this.counter -= size;
    }

    if (command === ECommand.CALL) {
      size = prevSize;
      this.counter -= prevSize;
    }

    if (command === ECommand.CHECK || command === ECommand.FOLD) {
      size = 0;
    }
    return size;
  }
}
