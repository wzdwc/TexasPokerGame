/* tslint:disable */
import {PokerStyle} from '../../../src/app/core/PokerStyle'

interface IPokerStyle {
  init(): void;
  isStraight(str?: string): number;
}

describe('test/app/core/pokerStyle.test.ts', () => {
  //
  it('full house', async () => {
    console.log(PokerStyle)
    let pokerStyle: IPokerStyle = new PokerStyle(['a1','b2', 'c3', 'b4', 'd1'], ['a2', 'b3'])
    console.log(pokerStyle)
  });
  it('tow full house', async () => {
    console.log(PokerStyle)
    let pokerStyle: IPokerStyle = new PokerStyle(['a1','b2', 'a3', 'b4', 'd1'], ['a2', 'b3'])
    console.log(pokerStyle)
  });
});
