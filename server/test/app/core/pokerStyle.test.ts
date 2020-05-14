/* tslint:disable */
import {PokerStyle} from '../../../src/app/core/PokerStyle';
const assert = require('assert');

describe('test/app/core/pokerStyle.test.ts', () => {
  it('Royal Flush', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['i1','j1', 'k1', 'l1', 'm1', 'a2', 'a4'])
    // console.log(pokerStyle)
    assert.strictEqual(pokerStyle.getPokerWeight() , '1000000000')
  });
  it('straight flush', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1','b1', 'c1', 'd1', 'e1', 'a2', 'a4'])
    // console.log(pokerStyle)
    assert.strictEqual(pokerStyle.getPokerWeight() , '0a00000000')
  });
  it('four of kind', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1','b2', 'a3', 'b4', 'd1', 'a2', 'a4'])
    assert.strictEqual(pokerStyle.getPokerWeight() , '00ad0000000')
  });
  //
  it('full house', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1','b2', 'c3', 'b4', 'd1', 'a2', 'b3'])
    assert.strictEqual(pokerStyle.getPokerWeight(), '000ba000000');
  });
  it('two full house', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1','b2', 'a3', 'b4', 'd1', 'a2', 'b3'])
    assert.strictEqual(pokerStyle.getPokerWeight() , '000ba000000')
  });
  it('straight', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1','c2', 'e3', 'b4', 'd1', 'g2', 'm3'])
    assert.strictEqual(pokerStyle.getPokerWeight() , '00000a0000')
  });
  it('tow pairs to tow full house', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1','b2', 'a3', 'b4', 'd1', 'd2', 'b3'])
    assert.strictEqual(pokerStyle.getPokerWeight() , '000bd000000')
  });
  it('tow pairs', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1','c2', 'd3', 'b4', 'f1', 'a2', 'c3'])
    assert.strictEqual(pokerStyle.getPokerWeight() , '0000000caf00')
  });
  it('high card', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1','i2', 'e3', 'b4', 'd1'])
    assert.strictEqual(pokerStyle.getPokerWeight() , '000000000miged')
  });
});
