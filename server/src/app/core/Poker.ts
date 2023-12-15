export interface IPoker {
  init(): void;

  getCard(): string;

  getRandom(number: number): number;
}

// 牌数字的编码
const CardNumberMap = {
  a: '2',
  b: '3',
  c: '4',
  d: '5',
  e: '6',
  f: '7',
  g: '8',
  h: '9',
  i: 'T',
  j: 'J',
  k: 'Q',
  l: 'K',
  m: 'A',
};

// 牌花色的编码
const CardColorMap = {
  1: '♦',
  2: '♣',
  3: '♥',
  4: '♠',
};

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

  /**
   * 将牌编码转换成实际的牌
   * @param code 如 a2
   * ```
   * formatCard('a2') -> ♣2
   * ```
   */
  static formatCard(code: string) {
    const num = code[0] as keyof typeof CardNumberMap;
    const color = code[1] as unknown as keyof typeof CardColorMap;
    return `${CardColorMap[color]}${CardNumberMap[num]}`;
  }

  /**
   * 将 codes 使用 formatCard 格式化然后用英文逗号拼接
   * @param codes
   * @returns
   */
  static formatCards(codes: string[]) {
    return codes
      .map((code) => this.formatCard(code))
      .filter(Boolean)
      .join(',');
  }
}
