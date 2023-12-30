export interface IPoker {
  init(): void;

  getCard(): string;

  // getRandom(number: number): number;
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
const CardColorEmojiMap = {
  1: '♦',
  2: '♣',
  3: '♥',
  4: '♠',
};

const CardColorLetterMap = {
  /** diamond */
  1: 'd',
  /** club */
  2: 'c',
  /** heart */
  3: 'h',
  /** spade */
  4: 's',
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
    this.shuffle();
  }

  // getCard(): string {
  //   if (this.pokers.length === 0) return 'done';
  //   const currCardIndex = this.getRandom(this.pokers.length);
  //   const currCard = this.pokers[currCardIndex];
  //   this.pokers.splice(currCardIndex, 1);
  //   return currCard;
  // }

  // getRandom(number: number): number {
  //   const maxNumber = Math.ceil(number);
  //   return Math.floor(Math.random() * maxNumber);
  // }

  getCard() {
    return this.pokers.shift() || 'done';
  }

  shuffle() {
    for (let i = this.pokers.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) << 0;
      [this.pokers[i], this.pokers[j]] = [this.pokers[j], this.pokers[i]];
    }
  }

  /**
   * 将牌编码转换成实际的牌
   * @param code 如 a2
   * @param useEmoji 默认true, 使用 emoji 显示花色
   * - 否则使用英文代表花色, s 黑桃, h 红桃, c 梅花, d 方块
   * ```
   * formatCard('a2') -> ♣2
   * formatCard('a2', false) -> 2c
   * ```
   */
  static formatCard(code: string, useEmoji = true) {
    const num = code[0] as keyof typeof CardNumberMap;
    const colorI = code[1] as unknown as keyof typeof CardColorEmojiMap;
    let color = CardColorEmojiMap[colorI];
    if (!useEmoji) {
      color = CardColorLetterMap[colorI];
    }
    return `${color}${CardNumberMap[num]}`;
  }

  /**
   * 将 codes 使用 formatCard 格式化然后用英文逗号拼接
   * @param codes
   * @param useEmoji 默认true, 使用 emoji 显示花色
   * - 否则使用英文代表花色, s 黑桃, h 红桃, c 梅花, d 方块
   * @returns
   */
  static formatCards(codes: string[], useEmoji = true) {
    return codes
      .map((code) => this.formatCard(code, useEmoji))
      .filter(Boolean)
      .join(',');
  }
}
