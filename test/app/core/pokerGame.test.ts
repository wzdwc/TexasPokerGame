import { PokerGame } from '../../../src/app/core/PokerGame';
// @ts-ignore
import { expect } from 'chai';
import { IPlayer } from '../../../src/app/core/Player';

describe('test/app/core/pokerGame.test.ts', () => {
  const users: IPlayer[] = [
    {
      userId: '1',
      position: 0,
      counter: 200,
    },
    {
      userId: '2',
      position: 1,
      counter: 200,
    },
  ];

  /**
   * game ready
   */
  it('game init', async () => {
    const game = new PokerGame({
      smallBlind: 1,
      users,
    });
    expect(game.status).to.equal(0);
    expect(game.currPlayer.node.counter).to.equal(199);
    expect(game.currPlayer.node.actionSize).to.equal(1);
    expect(game.pots[0]).to.equal(3);
    expect(game.pots[0]).to.equal(3);
  });

  /**
   * game playing
   */
  it('game play', async () => {
    const game = new PokerGame({
      smallBlind: 1,
      users,
    });
    game.play();
    console.log(game.currPlayer.node.handCard)
    console.log(game.commonCard);
    game.action('raise:10');
    game.action('raise:20');
    console.log(game.pots);
  });
  // flop
  // turn
  // river
  // chip in
    // has Allin need separate pot
      // many allin

  /**
   * game over
   */
  it('game over', async () => {
    // only one player
      // last player, other player fold

    // many player
      // last player, has all in player
      // all player all in
        // one player all in
        // many player all in
    // other pots
  });
  /**
   * count
   */
  it('count', async () => {

  });
  // has other pot
});
