/**
 * Created by jorky on 2020/2/23.
 */
import { Poker } from './Poker';
import { Player, IPlayer } from './Player';
import { PokerStyle } from './PokerStyle';

interface IPokerGame {
  users: IPlayer[];
  playerSize: number;
}

enum EGameStatus {
  GAME_READY,
  GAME_START,
  GAME_OVER,
}

class PokerGame {
  commonCard: string[] = [];
  fireCards: string[] = [];
  players: Player[] = [];
  poker = new Poker();
  pot = 0;
  status: EGameStatus = EGameStatus.GAME_READY;
  currPlayer = new Player();
  hasStraddle = false;
  winner = new Player();
  playerSize: number = 0;

  constructor(config: IPokerGame) {
    this.playerSize = config.playerSize;
    this.init(config.users);
  }

  init(users: IPlayer[]) {
    this.getPlayer(users);
  }

  play() {
    this.status = EGameStatus.GAME_START;
    this.getHandCard();
    console.log('player: ', ...this.players);
    // 烧卡
    this.fireCards.push(this.poker.getCard());
    // 翻牌圈
    this.flop();
    console.log('flop commonCard:', this.commonCard.join(','));
    // 烧卡
    this.fireCards.push(this.poker.getCard());
    // turn
    this.commonCard.push(this.poker.getCard());
    console.log('turn commonCard:', this.commonCard.join(','));
    // 烧卡
    this.fireCards.push(this.poker.getCard());
    // river
    this.commonCard.push(this.poker.getCard());
    console.log('river commonCard:', this.commonCard.join(','));
  }

  flop() {
    for (let i = 0; i < 3; i++) {
      this.commonCard.push(this.poker.getCard());
    }
  }

  compareCard(cards: string[], otherCards: string[]) {
    return new PokerStyle(cards).getPokerWeight() > new PokerStyle(otherCards).getPokerWeight();
  }

  getPlayer(users: IPlayer[]) {
    users.forEach(u => {
      const player = new Player(u);
      this.players.push(player);
    });
  }

  getWinner() {
    // only one player, others fold
    if (this.players.length === 1) {
      this.winner = this.players[0];
      this.winner.counter += this.pot;
    }
    if (this.status === EGameStatus.GAME_OVER) {
      this.winner.counter += this.pot;
    }
  }

  getHandCard() {
    for (let i = 0; i < 2; i++) {
      this.players.forEach(p => {
        p.handCard.push(this.poker.getCard());
      });
    }
  }
}
console.log(PokerGame);
