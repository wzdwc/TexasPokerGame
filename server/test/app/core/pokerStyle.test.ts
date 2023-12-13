/* tslint:disable */
import { PokerStyle } from '../../../src/app/core/PokerStyle';
const assert = require('assert');

describe('test/app/core/pokerStyle.test.ts', () => {
  it('Royal Flush', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['i1', 'j1', 'k1', 'l1', 'm1', 'a2', 'a4']);
    console.log('getPokerValueCard', pokerStyle.getPokerValueCard());
    assert.strictEqual(pokerStyle.getPokerWeight(), 'ijklm000000000');
  });
  it('straight flush', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1', 'b1', 'c1', 'd1', 'e1', 'a2', 'a4']);
    // console.log(pokerStyle)
    console.log('getPokerValueCard', pokerStyle.getPokerValueCard());
    assert.strictEqual(pokerStyle.getPokerWeight(), '0edcba00000000');
  });
  it('four of kind', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1', 'b2', 'a3', 'b4', 'd1', 'a2', 'a4']);
    console.log('getPokerValueCard', pokerStyle.getPokerValueCard());
    assert.strictEqual(pokerStyle.getPokerWeight(), '00ad0000000');
  });
  //
  it('full house', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1', 'b2', 'c3', 'b4', 'd1', 'a2', 'b3']);
    console.log('getPokerValueCard', pokerStyle.getPokerValueCard());
    assert.strictEqual(pokerStyle.getPokerWeight(), '000ba000000');
  });
  it('two full house', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1', 'b2', 'a3', 'b4', 'd1', 'a2', 'b3']);
    console.log('getPokerValueCard', pokerStyle.getPokerValueCard());
    assert.strictEqual(pokerStyle.getPokerWeight(), '000ba000000');
  });
  it('flush', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['m1', 'b1', 'k2', 'e1', 'f1', 'i1', 'k1']);
    console.log('getPokerValueCard', pokerStyle.getPokerValueCard());
    assert.strictEqual(pokerStyle.getPokerWeight(), '0000mkife00000');
  });
  it('straight', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1', 'c2', 'e3', 'b4', 'd1', 'g2', 'm3']);
    console.log('getPokerValueCard', pokerStyle.getPokerValueCard());
    assert.strictEqual(pokerStyle.getPokerWeight(), '00000abcde0000');
  });
  it('tow pairs to tow full house', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1', 'b2', 'a3', 'b4', 'd1', 'd2', 'b3']);
    console.log('getPokerValueCard', pokerStyle.getPokerValueCard());
    assert.strictEqual(pokerStyle.getPokerWeight(), '000bd000000');
  });
  it('tow pairs', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1', 'c2', 'd3', 'b4', 'f1', 'a2', 'c3']);
    console.log('getPokerValueCard', pokerStyle.getPokerValueCard());
    assert.strictEqual(pokerStyle.getPokerWeight(), '0000000caf00');
  });
  it('pairs', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['k1', 'c2', 'd3', 'b4', 'f1', 'a2', 'c3']);
    console.log('getPokerValueCard', pokerStyle.getPokerValueCard());
    assert.strictEqual(pokerStyle.getPokerWeight(), '00000000ckfd0');
  });
  it('high card', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['a1', 'i2', 'e3', 'b4', 'd1', 'g2', 'm3']);
    console.log('getPokerValueCard', pokerStyle.getPokerValueCard());
    assert.strictEqual(pokerStyle.getPokerWeight(), '000000000miged');
  });
  it('compare card', async () => {
    let pokerStyle: PokerStyle = new PokerStyle(['k2', 'k3', 'g2', 'e4', 'm3', 'm1', 'g1'], true);
    let pokerStyle2: PokerStyle = new PokerStyle(['k2', 'k3', 'g2', 'e4', 'm3', 'm2', 'c2'], true);
    console.log('getPokerValueCard', pokerStyle.getPokerValueCard());
    assert.strictEqual(pokerStyle.getPokerWeight(), pokerStyle2.getPokerWeight());
  });
});
