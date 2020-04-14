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
  winner: Player[][] = [];

  constructor(config: IPokerGame) {
    this.smallBlind = config.smallBlind;
    this.init(config.users);
  }

  init(users: IPlayer[]) {
    if (this.playerSize < 2) {
      throw 'player Inadequate';
    }

    this.status = EGameStatus.GAME_READY;
    // init playerLink
    this.playerLink = this.setPlayer(users);
    this.playerSize = users.length;
    // set SB, BB,Straddle
    this.getBlind();
    // utg
    this.currPlayer = this.playerLink.getNode(3);
  }

  getBlind() {
    // sb blind
    const SBPlayerNode = this.playerLink.getNode(1);
    const SBPlayer = SBPlayerNode.node;
    if (SBPlayerNode.next) {
      // big blind
      const BBPlayerNode: ILinkNode<Player> = SBPlayerNode.next;
      const BBPlayer = BBPlayerNode.node;
      SBPlayer.action(`small_blind:${this.smallBlind}`);
      BBPlayer.action(`big_blind:${this.smallBlind * 2}`);
      this.prevSize = this.smallBlind * 2;
      // add counter to pot
      // this.pots.push(this.smallBlind * 3);
      this.pot = this.smallBlind * 3;
      // todo straddle
    } else {
      throw 'player Inadequate';
    }
  }

  play() {
    this.status = EGameStatus.GAME_START;
    this.sendCard();
  }

  action(commandString: string) {
    if (this.status === EGameStatus.GAME_ACTION && this.currPlayer.next) {
      const commandArr = commandString.split(':');
      const command = commandArr[0];
      let size = Number(commandArr[1]);
      if (command === ECommand.ALL_IN) {
        size = this.currPlayer.node.counter > this.prevSize ?
          this.currPlayer.node.counter : this.prevSize;
        this.allIn();
        this.pot += this.currPlayer.node.counter;
        // other pot
        // only one player，or none player，game is over
      }
      if (command === ECommand.CALL) {
        size = this.prevSize;
        this.pot += size - this.currPlayer.node.actionSize;
      }
      if (command === ECommand.FOLD) {
        size = this.prevSize;
        this.removePlayer(this.currPlayer.node);
        // only one player，or none player，game is over
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
      // only 2 player, curr player fold, next player already action
      // only one player ,one player fold,other player allin
      // pre flop big blind check and other player call
      // console.log('this.currPlayer----------', this.currPlayer, nextPlayer, command);
      if (this.playerSize === 0
        || (command === ECommand.FOLD && this.currPlayer.next.node.actionSize !== 0)
        || (nextPlayer.actionSize === this.currPlayer.node.actionSize && command !== ECommand.FOLD)
        || (this.commonCard.length === 0
          && this.currPlayer.node.type === EPlayerType.BIG_BLIND
          && command === ECommand.CHECK)) {
        // console.log('ccc------', this.currPlayer, nextPlayer, command, this.playerSize);
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
    // pre flop
    if (this.commonCard.length === 0
      && this.currPlayer.node.actionSize === this.smallBlind * 2
      && this.currPlayer.node.type !== EPlayerType.BIG_BLIND) {
      if (this.currPlayer.next) {
        this.currPlayer = this.currPlayer.next;
      } else {
        throw 'currPlayer.next is null';
      }
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
    this.setSate();
    console.log(this.playerSize, 'playerS-------', this.status);
    if (this.status === EGameStatus.GAME_SHOWDOWN || this.playerSize <= 1) {
      this.gameOver();
    }
  }
  setSate() {
    if (this.status === EGameStatus.GAME_ACTION) {
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
      }
    } else {
      this.status = EGameStatus.GAME_ACTION;
    }
  }

  sendCard() {
    if (this.status === EGameStatus.GAME_START) {
      this.setHandCard();
      this.setSate();
      return;
    }
    if (this.status === EGameStatus.GAME_FLOP) {
      this.fireCards.push(this.poker.getCard());
      this.flop();
      this.setSate();
      return;
    }
    if (this.status === EGameStatus.GAME_TURN || this.status === EGameStatus.GAME_RIVER) {
      this.fireCards.push(this.poker.getCard());
      this.commonCard.push(this.poker.getCard());
      this.setSate();
      return;
    }
    throw 'error flow sendCard';
  }

  flop() {
    for (let i = 0; i < 3; i++) {
      this.commonCard.push(this.poker.getCard());
    }
  }

  compareCard(player: Player, otherPlayer: Player) {
    const firstWeight = player.pokeStyle;
    const lastWeight = otherPlayer.pokeStyle;
    let flag = -1;
    if (firstWeight > lastWeight) {
      flag = 1;
    }
    if (firstWeight === lastWeight) {
      flag = 0;
    }
    if (firstWeight < lastWeight) {
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

  getPlayers(type= 'all', withoutPlayers?: Player[]) {
    let players = [];
    let nextPlayer: ILinkNode<Player> = this.playerLink.link;
    let i = 0;
    while (i < this.playerSize) {
      players.push(nextPlayer.node);
      if (nextPlayer.next) {
        nextPlayer = nextPlayer.next;
      }
      i++;
    }
    players = type === 'all' ? [ ...players, ...this.allInPlayers ] : players;
    return withoutPlayers ? players.filter(p => {
      const isNotPlayer = withoutPlayers.filter(withoutPlayer => withoutPlayer.userId === p.userId
        || withoutPlayer.evPot >= p.evPot);
      return isNotPlayer.length === 0;
    }) : players;
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
      this.sendCard();
      this.setSate();
    }

    this.getPlayerPokeStyle();

    const getOtherWinner = (withoutPlayers: Player[]) => {
      // all player allin, winner can't get all pot
      const allPlayer = this.getPlayers('all', withoutPlayers);
      const maxLastPlayer = this.getMaxPlayers(allPlayer);
      this.winner.push(maxLastPlayer);
      if (this.getLeftoverPot() > 0) {
        getOtherWinner([ ...withoutPlayers, ...maxLastPlayer ]);
      }
    };
    getOtherWinner([]);
    // // compare allin player and last player
    // const allPlayers: Player [] = this.getPlayers()
    // const maxPlayers = this.getMaxPlayers(allPlayers);
    // this.winner.push(maxPlayers);
    // // max player can't winner all pot
    // const hasSecondWinner = maxPlayers[0].evPot < this.pot;
    // // all of winner is all in, must get max curr player
    // if (hasSecondWinner) {
    //   // all player allin, winner can't get all pot
    //   getOtherWinner(maxPlayers);
    // }
  }

  getPlayerPokeStyle() {
    this.allPlayer.map(p => {
      p.pokeStyle = new PokerStyle([ ...p.getHandCard(), ...this.commonCard ]).getPokerWeight();
      return p;
    });
  }

  getLeftoverPot() {
    if (this.winner.length === 0) {
      return this.pot;
    }
    return this.pot - this.winner[this.winner.length - 1][0].evPot;
  }

  getMaxPlayers(lastPlayers: Player[]) {
    const _maxPlayers: Player[] = [];
    const maxPlayer = lastPlayers.reduce((acc, cur) => {
      return this.compareCard(acc, cur) === 1 ? acc : cur;
    });
    // has many winner ,equal max player
    lastPlayers.forEach(p => {
      if (this.compareCard(p, maxPlayer) === 0) {
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
        if (playerLink.next) {
          playerLink = playerLink.next;
        }
        j++;
      }
    }
  }
  counting() {
    let prevEvPot = 0;
    this.winner.forEach((winnerList, key) => {
      if (key !== 0) {
        prevEvPot = this.winner[key - 1][0].evPot;
      }
      winnerList.forEach(winner => {
        winner.income((winner.evPot - prevEvPot) / winnerList.length);
      });
    });
  }
  gameOver() {
    // only one player,other fold
    this.getWinner();
    // todo counting
    this.counting();
  }
}
