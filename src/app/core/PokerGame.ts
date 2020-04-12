/**
 * Created by jorky on 2020/2/23.
 */
import { Poker } from './Poker';
import { ECommand, EPlayerType, IPlayer, Player } from './Player';
import { PokerStyle } from './PokerStyle';
import { ILinkNode, Link } from '../../utils/Link';

interface IPokerGame {
  users: IPlayer[];
  smallBlind: number;
}

export enum EGameStatus {
  GAME_READY,
  GAME_START,
  GAME_FLOP,
  GAME_TURN,
  GAME_RIVER,
  GAME_ACTION,
  GAME_SHOWDOWN,
  GAME_OVER,
}

export class PokerGame {
  commonCard: string[] = [];
  fireCards: string[] = [];
  playerLink: Link<Player>;
  allPlayer: Player[] = [];
  poker = new Poker();
  pot: number;
  status: EGameStatus;
  currPlayer: ILinkNode<Player>;
  smallBlind: number;
  playerSize: number;
  prevSize: number;
  prevPot: number;
  allInPlayers: Player[] = [];
  currActionAllinPlayer: Player[] = [];
  hasStraddle = false;
  winner: Player[][];

  constructor(config: IPokerGame) {
    this.smallBlind = config.smallBlind;
    this.init(config.users);
  }

  init(users: IPlayer[]) {
    this.status = EGameStatus.GAME_READY;
    // init playerLink
    this.playerLink = this.setPlayer(users);
    this.playerSize = users.length;
    // set SB, BB,Straddle
    this.getBlind();
    // utg
    this.currPlayer = this.playerLink.getNode(3);
    console.log(this.currPlayer, '--------------------');
  }

  getBlind() {
    // sb blind
    const SBPlayerNode = this.playerLink.getNode(1);
    const SBPlayer = SBPlayerNode.node;
    // big blind
    const BBPlayerNode = SBPlayerNode.next;
    const BBPlayer = BBPlayerNode.node;
    SBPlayer.action(`small_blind:${this.smallBlind}`);
    BBPlayer.action(`big_blind:${this.smallBlind * 2}`);
    this.prevSize = this.smallBlind * 2;
    // add counter to pot
    // this.pots.push(this.smallBlind * 3);
    this.pot = this.smallBlind * 3;
    // todo straddle
  }

  play() {
    this.status = EGameStatus.GAME_START;
    this.sendCard();
  }

  action(commandString: string) {
    if (this.status === EGameStatus.GAME_ACTION) {
      console.log('this.currPlayer', this.currPlayer);
      const commandArr = commandString.split(':');
      const command = commandArr[0];
      let size = Number(commandArr[1]);
      if (command === ECommand.ALL_IN) {
        size = this.currPlayer.node.counter > this.prevSize ?
          this.currPlayer.node.counter : this.prevSize;
        this.allIn();
        this.pot += this.currPlayer.node.counter;
        // other pot
      }
      if (command === ECommand.CALL) {
        size = this.prevSize;
        this.pot += size - this.currPlayer.node.actionSize;
      }
      if (command === ECommand.FOLD) {
        size = this.prevSize;
        this.removePlayer(this.currPlayer.node);
      }
      if (command === ECommand.CHECK) {
        console.log(this.currPlayer.node.type === EPlayerType.BIG_BLIND
          && this.prevSize === this.smallBlind * 2, 'big blind', this.currPlayer);
        // prev player must be check
        if (!(this.prevSize === 0 ||
          (this.currPlayer.node.type === EPlayerType.BIG_BLIND
          && this.prevSize === this.smallBlind * 2))) {
          throw 'incorrect action: check';
        }
      }
      if (command === ECommand.RAISE) {
        console.log(size, 'prevSize', this.prevSize);
        this.pot += size;
        // 3 bet
        size += this.currPlayer.node.actionSize;

        if ((size + this.currPlayer.node.actionSize) < this.prevSize * 2) {
          throw 'incorrect action: raise';
        }
      }
      this.currPlayer.node.action(commandString, this.prevSize);
      this.prevSize = size;
      const nextPlayer = this.currPlayer.next.node;
      // all check actionSize === -1
      // all player allin
      // only 2 player ,one player fold
      // pre flop big blind check and other player call
      if (this.playerSize === 0
        || (this.playerSize === 2 && command === ECommand.FOLD)
        || nextPlayer.actionSize === this.currPlayer.node.actionSize
        || (this.commonCard.length === 0
          && this.currPlayer.node.type === EPlayerType.BIG_BLIND
          && command === ECommand.CHECK)) {
        this.actionComplete();
        return;
      }
      this.currPlayer = this.currPlayer.next;
    } else {
      throw 'incorrect action flow';
    }
  }
  allIn() {
    this.currActionAllinPlayer.push(this.currPlayer.node);
    this.removePlayer(this.currPlayer.node);
  }

  private actionComplete() {
    console.log('pre flop,', this.commonCard.length, this.currPlayer.node);
    // pre flop
    if (this.commonCard.length === 0
      && this.currPlayer.node.actionSize === this.smallBlind * 2
      && this.currPlayer.node.type !== EPlayerType.BIG_BLIND) {
      this.currPlayer = this.currPlayer.next;
      return;
    }
    // action has allin, sum the allin player ev_pot
    if (this.currActionAllinPlayer.length !== 0) {
      let currAllinPlayerPot = 0;
      this.currActionAllinPlayer.forEach(allinPlayer => {
        this.allPlayer.forEach(p => {
          if (p.actionSize < allinPlayer.actionSize) {
            currAllinPlayerPot += p.actionSize;
          } else {
            currAllinPlayerPot += allinPlayer.actionSize;
          }
        });
        allinPlayer.evPot = this.prevPot + currAllinPlayerPot;
        currAllinPlayerPot = 0;
      });
      this.allInPlayers = [ ...this.allInPlayers, ...this.currActionAllinPlayer ];
    }
    // action complete clear player actionSize = 0
    this.clearPlayerAction();
    this.currActionAllinPlayer = [];
    this.prevSize = 0;
    this.prevPot = this.pot;
    // new action ring first action is sb
    this.currPlayer = this.playerLink.getNode(1);
    if (this.commonCard.length === 0) {
      this.status = EGameStatus.GAME_FLOP;
    }
    if (this.commonCard.length === 3) {
      this.status = EGameStatus.GAME_TURN;
    }
    if (this.commonCard.length === 4) {
      this.status = EGameStatus.GAME_RIVER;
    }
    if (this.commonCard.length === 5) {
      this.status = EGameStatus.GAME_SHOWDOWN;
      this.gameOver();
    }
  }

  sendCard() {
    if (this.status === EGameStatus.GAME_START) {
      this.setHandCard();
      this.status = EGameStatus.GAME_ACTION;
      return;
    }
    if (this.status === EGameStatus.GAME_FLOP) {
      this.fireCards.push(this.poker.getCard());
      this.flop();
      this.status = EGameStatus.GAME_ACTION;
      return;
    }
    if (this.status === EGameStatus.GAME_TURN || this.status === EGameStatus.GAME_RIVER) {
      this.fireCards.push(this.poker.getCard());
      this.commonCard.push(this.poker.getCard());
      this.status = EGameStatus.GAME_ACTION;
      return;
    }
    throw 'error flow sendCard';
  }

  flop() {
    for (let i = 0; i < 3; i++) {
      this.commonCard.push(this.poker.getCard());
    }
  }

  compareCard(cards: string[], otherCards: string[]) {
    const firstWeight = new PokerStyle(cards).getPokerWeight();
    const lastWeight = new PokerStyle(otherCards).getPokerWeight();
    let flag = -1;
    if (firstWeight > lastWeight) {
      flag = 1;
    }
    if (firstWeight === lastWeight) {
      flag = 0;
    }
    if (firstWeight > lastWeight) {
      flag = -1;
    }
    return flag;
  }

  setPlayer(users: IPlayer[]) {
    users.forEach((u, position) => {
      const player = new Player({
        ...u,
        position,
      });
      this.allPlayer.push(player);
    });
    return new Link<Player>(this.allPlayer);
  }

  getPlayers(type= 'all') {
    const players = [];
    let nextPlayer = this.playerLink.link;
    let i = 0;
    while (i < this.playerSize) {
      players.push(nextPlayer.node);
      nextPlayer = nextPlayer.next;
      i++;
    }
    return type === 'all' ? [ ...players, ...this.allInPlayers ] : players;
  }

  private clearPlayerAction() {
    this.allPlayer.forEach(player => {
      player.clearActionSize();
    });
  }

  removePlayer(currPlayer: Player) {
    let playerLink = this.playerLink.link;
    let player: Player;
    while (playerLink.next) {
      player = playerLink.next.node;
      if (currPlayer.userId === player.userId) {
        playerLink.next = playerLink.next.next;
        this.playerSize--;
        return;
      }
      playerLink = playerLink.next;
    }
  }

  getWinner() {
    if (this.allInPlayers.length === 0 && this.playerSize === 1) {
      this.winner.push([ this.currPlayer.node ]);
      return;
    }
    while (this.status !== EGameStatus.GAME_SHOWDOWN) {
      this.actionComplete();
      this.sendCard();
    }
    // compare allin player and last player
    const allPlayers = this.getPlayers();
    const maxPlayers = this.maxPlayers(allPlayers);
    this.winner.push(maxPlayers);
    const hasSecondWinner = maxPlayers.filter(p => p.evPot !== 0).length === 0;
    // all of winner is all in, must get max curr player
    if (hasSecondWinner) {
      const lastPlayer = this.getPlayers('');
      const maxLastPlayer = this.maxPlayers(lastPlayer);
      this.winner.push(maxLastPlayer);
    }
  }

  maxPlayers(lastPlayers: Player[]) {
    const _maxPlayers: Player[] = [];
    const maxPlayer = lastPlayers.reduce((acc, cur) => {
      const accPlayerCards: string[] = [ ...acc.getHandCard(), ...this.commonCard ];
      const curPlayerCards: string[] = [ ...cur.getHandCard(), ...this.commonCard ];
      return this.compareCard(accPlayerCards, curPlayerCards) === 1 ? acc : cur;
    });
    lastPlayers.forEach(p => {
      const playerCards: string[] = [ ...p.getHandCard(), ...this.commonCard ];
      const maxPlayerCards: string[] = [ ...maxPlayer.getHandCard(), ...this.commonCard ];
      // has many winner ,equal max player
      if (this.compareCard(playerCards, maxPlayerCards) === 0) {
        _maxPlayers.push(p);
      }
    });
    return _maxPlayers;
  }

  setHandCard() {
    // send card start by small blind
    let playerLink = this.playerLink.link;
    let player: Player;
    for (let i = 0; i < 2; i++) {
      let j = 0;
      while (j < this.playerSize) {
        player = playerLink.node;
        player.handCard.push(this.poker.getCard());
        playerLink = playerLink.next;
        j++;
      }
    }
  }
  gameOver() {
    // only one player,other fold
    this.getWinner();
    // todo counting

  }
}
