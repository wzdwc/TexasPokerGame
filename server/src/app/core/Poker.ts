export interface IPoker {
  init(): void;

  getCard(): string;

  getRandom(number: number): number;
}

/**
 * Created by jorky on 2020/2/23.
 */
export class Poker implements IPoker {
  private pokers: string[] = [];
  private readonly isShort: boolean;

  constructor(isShort = false) {
    this.isShort = isShort;
    this.init();
  }

  init(): void {
    let size = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'];
    if (this.isShort) {
      size = ['e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'];
    }
    const color = [1, 2, 3, 4];
    for (const i of size) {
      for (const j of color) {
        this.pokers.push(`${i}${j}`);
      }
    }
  }

  getCard(): string {
    if (this.pokers.length === 0) return 'done';
    const currCardIndex = this.getRandom(this.pokers.length);
    const currCard = this.pokers[currCardIndex];
    this.pokers.splice(currCardIndex, 1);
    return currCard;
  }

  getRandom(number: number): number {
    const maxNumber = Math.ceil(number);
    return Math.floor(Math.random() * maxNumber);
  }
}
