const POKER_STR = 'abcdefghijklm';

function sort(cards: string []): string[] {
  let temp = '';
  // 排序
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (cards[i] > cards[j]) {
        temp = cards[i];
        cards[i] = cards[j];
        cards[j] = temp;
      }
    }
  }
  return cards;
}

interface IPokerStyle {
  init(): void;

  isStraight(str?: string []): string;
}

enum PokerStyleEnum {
  'ROYAL_FlUSH',
  'STRAIGHT_FLUSH',
  'FOUR_KIND',
  'FULL_HOUSE',
  'FLUSH',
  'STRAIGHT',
  'THREE_KIND',
  'TWO_PAIR',
  'PAIR',
  'HIGH_CARD',
}

enum ShortPokerStyleEnum {
  'ROYAL_FlUSH',
  'STRAIGHT_FLUSH',
  'FOUR_KIND',
  'FLUSH',
  'FULL_HOUSE',
  'THREE_KIND',
  'STRAIGHT',
  'TWO_PAIR',
  'PAIR',
  'HIGH_CARD',
}

export class PokerStyle implements IPokerStyle {
  private readonly cards: string[] = [];
  private readonly isShort: boolean;
  private flushObj: { [key: string]: any } = {
    1: [],
    2: [],
    3: [],
    4: [],
  };
  private flushColor: string = '';
  private straightArr: string[] = [];
  private styleName = [
    'ROYAL_FlUSH',
    'STRAIGHT_FLUSH',
    'FOUR_KIND',
    'FULL_HOUSE',
    'FLUSH',
    'STRAIGHT',
    'THREE_KIND',
    'TWO_PAIR',
    'PAIR',
    'HIGH_CARD'];
  private pokerStyle: string[] = [
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0',
    '0'];
  private numObj: Map<string, number> = new Map(
    POKER_STR.split('').map((m) => [m, 0]));

  constructor(cards: string[], isShort= false) {
    this.cards = sort(cards);
    this.isShort = isShort;
    if (this.isShort) {
      this.styleName = [
        'ROYAL_FlUSH',
        'STRAIGHT_FLUSH',
        'FOUR_KIND',
        'FLUSH',
        'FULL_HOUSE',
        'THREE_KIND',
        'STRAIGHT',
        'TWO_PAIR',
        'PAIR',
        'HIGH_CARD',
      ];
    }
    this.init();
  }

  public isStraight(str?: string []): string {
    const straightStr = str && str.join('') || [ ...new Set(this.straightArr) ].join('');
    let first = -1;
    let second = -1;
    let three = -1;
    function indexOf(pokeString: string): number {
      return POKER_STR.indexOf(pokeString);
    }
    if (straightStr.length === 5 && indexOf(straightStr) > -1) {
      return POKER_STR.slice(indexOf(straightStr), indexOf(straightStr) + 5);
    }
    if (straightStr.length === 6) {
      first = indexOf(straightStr.slice(0, 5));
      second = indexOf(straightStr.slice(1, 6));
      if (Math.max(first, second) > -1) {
        const max = Math.max(first, second);
        return POKER_STR.slice(max, max + 5);
      }
    }
    if (straightStr.length === 7) {
      first = indexOf(straightStr.slice(0, 5));
      second = indexOf(straightStr.slice(1, 6));
      three = indexOf(straightStr.slice(2, 7));
      if (Math.max(first, second, three) > -1) {
        const max = Math.max(first, second, three);
        return POKER_STR.slice(max, max + 5);
      }
    }
    // special straight "A2345",'m' -> A
    if (!this.isShort && straightStr.indexOf('m') > -1 && straightStr.indexOf('abcd') > -1) {
      return 'abcdm';
    }
    // special straight "A2345",'m' -> A
    if (this.isShort && straightStr.indexOf('m') > -1 && straightStr.indexOf('efgh') > -1) {
      return 'efghm';
    }
    return '0';
  }

  public getPokerWeight() {
    return this.pokerStyle.join('');
  }

  public getPokerStyleName() {
    for (let i = 0; i < this.pokerStyle.length; i++) {
      if (this.pokerStyle[i] !== '0') {
        return this.styleName[i];
      }
    }
  }

  public init() {
    let i = 0;
    const isTwo = [];
    const isThree = [];
    let isFour = '0';
    let isFullHouse = '0';
    // const isStraightFlush = '0';
    let isFlush: string[] = [];
    let isRoyalFlush = '0';
    let isThreeKind = '';
    let isTowPair = '';
    let isPair = '';
    const highCard = [];

    while (i < this.cards.length) {
      const color = this.cards[i][1];
      const num = this.cards[i][0];
      this.straightArr.push(this.cards[i][0]);
      this.flushObj[color].push(num);
      let value = this.numObj.get(num) || 0;
      value++;
      this.numObj.set(num, value);
      i++;
    }

    // find flush
    for (const f in this.flushObj) {
      if (this.flushObj[f].length >= 5) {
        // flush is order,so flush[length - 1] is max flush card
        isFlush = this.flushObj[f];
        this.flushColor = f;
      }
    }

    // find two,three,four
    for (const [key, value] of this.numObj) {
      // high card
      if (value === 1) {
        highCard.unshift(key);
      }
      // pairs max count 3, source is small to large
      if (value >= 2) {
        isTwo.unshift(key);
      }
      // three of kind max count 2
      if (value === 3) {
        isThree.unshift(key);
      }
      // four of kind only one
      if (value === 4) {
        isFour = key;
      }
    }
    // straight flush
    if (isFlush.length !== 0 && this.isStraight(isFlush) !== '0') {
      if (this.isStraight(isFlush) === 'ijklm') {
        isRoyalFlush = 'ijklm';
        this.pokerStyle[0] = isRoyalFlush;
        return;
      }
      this.pokerStyle[1] = this.isStraight(isFlush).split('').reverse().join('');
      return;
    }

    // four of kind
    if (isFour !== '0') {
      isFour += highCard[0];
      this.pokerStyle[2] = isFour;
      return;
    }

    // full house
    if (isThree.length > 0 && isTwo.length > isThree.length ||
      isThree.length === 2) {
      const maxTwoCard = isThree.length === 2 ? isThree[1] : isThree[0] ===
      isTwo[0] ? isTwo[1] : isTwo[0];
      const maxThree = isThree[0];
      isFullHouse = maxThree + maxTwoCard;
      if (this.isShort) {
        this.pokerStyle[4] = isFullHouse;
      } else {
        this.pokerStyle[3] = isFullHouse;
      }
      return;
    }

    // flush
    if (isFlush.length !== 0) {
      isFlush.reverse().length = 5;
      if (this.isShort) {
        this.pokerStyle[3] = isFlush.join('');
      } else {
        this.pokerStyle[4] = isFlush.join('');
      }
      return;
    }
    console.log('come in -------', isThree)

    if (this.isShort) {
      // three of kind
      if (isThree.length > 0) {
        isThreeKind = isThree.join('');
        isThreeKind += highCard[0] + highCard[1];
        this.pokerStyle[5] = isThreeKind;
        return;
      }

      // straight
      if (this.isStraight() !== '0') {
        this.pokerStyle[6] = `${this.isStraight()}`;
        return;
      }

    } else {
      // straight
      if (this.isStraight() !== '0') {
        this.pokerStyle[5] = `${this.isStraight()}`;
        return;
      }

      // three of kind
      if (isThree.length > 0) {
        isThreeKind = isThree.join('');
        isThreeKind += highCard[0] + highCard[1];
        this.pokerStyle[6] = isThreeKind;
        return;
      }
    }

    // tow pair
    if (isTwo.length >= 2) {
      const towPair = isTwo;
      towPair.length = 2;
      isTowPair = towPair.join('');
      // third tow pair card big then high card
      const highCardForTowPair = isTwo[3] && isTwo[3] > highCard[0] ? isTwo[3] : highCard[0];
      isTowPair += highCardForTowPair;
      this.pokerStyle[7] = isTowPair;
      return;
    }
    // pair
    if (isTwo.length === 1) {
      isPair = isTwo.join('');
      isPair += highCard[0] + highCard[1] + highCard[2];
      this.pokerStyle[8] = isPair;
      return;
    }
    // High card
    highCard.length = 5;
    this.pokerStyle[9] = highCard.join('');
  }
  public getPokerValueCard() {
    let valueStyle = '';
    let isFlush = false;
    this.pokerStyle.forEach((style, key) => {
      if (style !== '0') {
        isFlush = key === 1 || this.isShort ? key === 3 : key === 4;
        valueStyle = style;
      }
    });
    const cards = this.cards.filter((card) => {
      if (isFlush) {
        return valueStyle.indexOf(card[0]) > -1 && card[1] === this.flushColor;
      }
      return valueStyle.indexOf(card[0]) > -1;
    });
    cards.reverse().length = 5;
    return cards;
  }
}
