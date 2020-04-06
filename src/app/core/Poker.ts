import { Application } from 'midway';
export interface IPoker {
  init(redis: any): void;

  getCard(): string;

  getRandom(number: number): number;
}

/**
 * Created by jorky on 2020/2/23.
 */
export class Poker implements IPoker {
  pokers: string[] = [];


  redis: any = '';

  roomId = '';

  gameId = '';

  constructor(app: Application, roomId: string, gameId: string) {
    this.roomId = roomId;
    this.gameId = gameId;
    this.redis = app.redis;
    const hasPoker = this.hasPokers();
    if (hasPoker) {
      this.pokers = hasPoker;
    } else {
      this.init();
    }
  }

  init() {
    const size = [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm' ];
    const color = [ 1, 2, 3, 4 ];
    for (const i of size) {
      for (const j of color) {
        this.pokers.push(`${i}:${j}`);
      }
    }
    // start game ,init pokers
    this.setPokers();
  }

  hasPokers() {
    return this.redis.get(`${this.roomId}:${this.gameId}`);
  }

  setPokers() {
    this.redis.set(`${this.roomId}:${this.gameId}`, this.pokers.join(''));
  }

  getCard(): string {
    if (this.pokers.length === 0) return 'done';
    const currCardIndex = this.getRandom(this.pokers.length);
    const currCard = this.pokers[currCardIndex];
    this.pokers.splice(currCardIndex, 1);
    this.setPokers();
    return currCard;
  }

  getRandom(number: number): number {
    const maxNumber = Math.ceil(number);
    return Math.floor(Math.random() * maxNumber);
  }
}

// let poker = new Poker()
// let arr = []
// for(let i = 0; i< 53; i++) {
//   arr.push(poker.getCard())
// }
// console.log(arr)
