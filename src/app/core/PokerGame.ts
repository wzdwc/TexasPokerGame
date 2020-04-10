/**
 * Created by jorky on 2020/2/23.
 */
import { Poker } from './Poker';
import { ECommand, IPlayer, Player } from './Player';
import { PokerStyle } from './PokerStyle';
import { ILinkNode, Link } from '../../utils/Link';

interface IPokerGame {
  users: IPlayer[];
  smallBlind: number;
}

enum EGameStatus {
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
  players: Link<Player>;
  poker = new Poker();
  pots: number[] = [];
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
  winner: Player;

  constructor(config: IPokerGame) {
    this.smallBlind = config.smallBlind;
    this.init(config.users);
  }

  init(users: IPlayer[]) {
    this.status = EGameStatus.GAME_READY;
    // init players
    this.players = this.setPlayer(users);
    this.playerSize = users.length;
    // set SB, BB,Straddle
    this.getBlind();
    // utg
    this.currPlayer = this.players.getNode(3);
  }

  getBlind() {
    // sb blind
    const SBPlayerNode = this.players.getNode(1);
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
      const commandArr = commandString.split(':');
      const command = commandArr[0];
      let size = Number(commandArr[1]);
      if (command === ECommand.ALL_IN) {
        size = this.currPlayer.node.counter;
        this.allIn();
        this.pot += size;
        // other pot
      }
      if (command === ECommand.CALL) {
        // counter small then raise size,must be all in
        if (size > this.currPlayer.node.counter) {
          size = this.currPlayer.node.counter;
          this.allIn();
        } else {
          size = this.prevSize;
          this.pot += size;
        }
      }
      if (command === ECommand.FOLD) {
        size = this.prevSize;
        this.removePlayer(this.currPlayer.node);
      }
      // if (command === ECommand.CHECK) {
      //   // prev player must be check
      //   if (this.prevSize === 0) {
      //     size = 0;
      //   } else {
      //     throw 'action incorrect';
      //   }
      // }
      if (command === ECommand.RAISE) {
        if (size < this.prevSize * 2) {
          throw 'action incorrect';
        }
        this.pot += size;
      }
      this.currPlayer.node.action(commandString, this.prevSize);
      this.prevSize = size;
      const nextPlayer = this.currPlayer.next.node;
      if (nextPlayer.actionSize === this.currPlayer.node.actionSize) {
        this.actionComplete();
      }
      this.currPlayer = this.currPlayer.next;
    } else {
      throw 'error action';
    }
  }
  allIn() {
    this.currActionAllinPlayer.push(this.currPlayer.node);
    this.removePlayer(this.currPlayer.node);
  }

  private actionComplete() {
    // action has allin, sum the allin player ev_pot
    if (this.currActionAllinPlayer.length !== 0) {
      let currAllinPlayerPot = 0;
      const players = this.getPlayers();
      this.currActionAllinPlayer.forEach(actionP => {
        players.forEach(p => {
          if (p.actionSize < actionP.actionSize) {
            currAllinPlayerPot += p.actionSize;
          } else {
            currAllinPlayerPot += actionP.actionSize;
          }
        });
        actionP.evPot = this.prevPot + currAllinPlayerPot;
      });
      this.allInPlayers.concat(this.currActionAllinPlayer);
    }

    // action complete clear player actionSize = 0
    this.clearPlayerAction();
    this.currActionAllinPlayer = [];
    this.prevSize = 0;
    this.prevPot = this.pot;
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
    }
    if (this.status === EGameStatus.GAME_FLOP) {
      this.fireCards.push(this.poker.getCard());
      this.flop();
    }
    if (this.status === EGameStatus.GAME_TURN || this.status === EGameStatus.GAME_RIVER) {
      this.fireCards.push(this.poker.getCard());
      this.commonCard.push(this.poker.getCard());
    }
    this.status = EGameStatus.GAME_ACTION;
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
    const players: Player [] = [];
    users.forEach(u => {
      const player = new Player(u);
      players.push(player);
    });
    return new Link<Player>(players);
  }

  getPlayers(type= 'all') {
    const players = [];
    let nextPlayer = this.players.link;
    let i = 0;
    while (i < this.playerSize) {
      players.push(nextPlayer.node);
      nextPlayer = nextPlayer.next;
      i++;
    }
    return type === 'all' ? [ ...players, ...this.allInPlayers ] : players;
  }

  private clearPlayerAction() {
    let playerLink = this.players.link;
    let player: Player;
    let j = 0;
    while (j < this.playerSize) {
      player = playerLink.node;
      player.clearActionSize();
      playerLink = playerLink.next;
      j++;
    }
  }

  removePlayer(currPlayer: Player) {
    let playerLink = this.players.link;
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
      this.winner = this.currPlayer.node;
      return;
    }
    while (this.status !== EGameStatus.GAME_SHOWDOWN) {
      this.actionComplete();
      this.sendCard();
    }
    // compare allin player and last player
    const allPlayers = this.getPlayers();
    const winner = [];
    const maxPlayers = this.maxPlayers(allPlayers);
    winner.push(maxPlayers);
    const hasSecondWinner = maxPlayers.filter(p => p.evPot !== 0).length === 0;
    // all of winner is all in, must get max curr player
    if (hasSecondWinner) {
      const lastPlayer = this.getPlayers('');
      const maxLastPlayer = this.maxPlayers(lastPlayer);
      winner.push(maxLastPlayer);
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
    let playerLink = this.players.link;
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
