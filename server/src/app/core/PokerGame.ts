/**
 * Created by jorky on 2020/2/23.
 */
import { IPoker, Poker } from './Poker';
import { ECommand, EPlayerType, IPlayer, Player } from './Player';
import { PokerStyle } from './PokerStyle';
import { ILinkNode, Link } from '../../utils/Link';
import Timeout = NodeJS.Timeout;

/**
 * Poker game class interface
 */
interface IPokerGame {
  users: IPlayer[];
  smallBlind: number;
  isShort: boolean;
  actionRoundComplete: () => void;
  gameOverCallBack: () => void;
  autoActionCallBack: (actionType: string, userId: string) => void;
}

/**
 * Game over enum
 */
export enum EGameOverType {
  GAME_SHOWDOWN = 1,
  GAME_OVER = 2,
}

/**
 * Game state enum
 */
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

/**
 * Action time
 * @type {number}
 */
const ACTION_TIME = 30 * 1000;

/**
 * Class representing a poker game
 */
export class PokerGame {
  private playerLink: Link<Player>;
  private poker: IPoker;
  private prevPot: number = 0;
  private actionTimeOut: Timeout;
  private currActionAllinPlayer: Player[] = [];
  // It's a short poker game
  private readonly isShort: boolean;
  private readonly smallBlind: number;
  private readonly actionRoundComplete: () => void;
  private readonly gameOverCallBack: () => void;
  private readonly autoActionCallBack: (actionType: string, userId: string) => void;
  // hasStraddle = false;
  public slidePots: number [] = [];
  public prevSize: number;
  public currPlayer: ILinkNode<Player>;
  public allInPlayers: Player[] = [];
  public playerSize: number;
  public pot: number;
  public status: EGameStatus;
  public commonCard: string[] = [];
  public winner: Player[][] = [];
  public allPlayer: Player[] = [];
  public SBPlayer: Player;
  public BBPlayer: Player;
  public gameOverType: EGameOverType;

  constructor(config: IPokerGame) {
    this.smallBlind = config.smallBlind;
    this.actionRoundComplete = config.actionRoundComplete;
    this.gameOverCallBack = config.gameOverCallBack;
    this.autoActionCallBack = config.autoActionCallBack;
    console.log(config.isShort, 'poker--------------');
    this.isShort = config.isShort;
    this.poker = new Poker(this.isShort);
    if (config.users.length < 2) {
      throw 'player Inadequate';
    }
    this.init(config.users);
  }

  init(users: IPlayer[]) {
    this.status = EGameStatus.GAME_READY;
    // init playerLink
    this.playerLink = this.setPlayer(users);
    this.playerSize = users.length;
    // set SB, BB,Straddle
    this.setBlind();
    // UTG
    this.currPlayer = this.playerLink.getNode(3);
  }

  /**
   * game init blind (SB,BB)
   */
  private setBlind() {
    // sb blind
    const SBPlayerNode = this.playerLink.getNode(1);
    this.SBPlayer = SBPlayerNode.node;
    if (SBPlayerNode.next) {
      // big blind
      const BBPlayerNode: ILinkNode<Player> = SBPlayerNode.next;
      this.BBPlayer = BBPlayerNode.node;
      this.SBPlayer.action(`sb:${this.smallBlind}`);
      this.BBPlayer.action(`bb:${this.smallBlind * 2}`);
      this.prevSize = this.smallBlind * 2;
      this.pot = this.smallBlind * 3;
      // todo straddle
    } else {
      throw 'player Inadequate';
    }
  }

  /**
   * Get game winner
   */
  getWinner() {
    // only one winner, other players fold
    if (this.allInPlayers.length === 0 && this.playerSize === 1
      || this.allInPlayers.length === 1 && this.playerSize === 0) {
      console.log('only one player');
      this.gameOverType = EGameOverType.GAME_OVER;
      const winner = this.allInPlayers[0] || this.currPlayer.node;
      this.status = EGameStatus.GAME_OVER;
      this.winner.push([ winner ]);
      return;
    }
    // game show down
    while (this.status !== EGameStatus.GAME_SHOWDOWN) {
      this.sendCard();
      this.setSate();
    }

    this.status = EGameStatus.GAME_OVER;
    this.gameOverType = EGameOverType.GAME_SHOWDOWN;

    this.getPlayerPokerStyle();

    /**
     * The max player can't win all of pot, get the largest of the remaining players
     * @param {Player[]} excludePlayers - exclude players
     */
    const getOtherWinner = (excludePlayers: Player[]) => {
      // all player allin, winner can't get all pot
      const allPlayer = this.getPlayers('all', excludePlayers);
      // all player are exclude
      if (allPlayer.length === 0) {
        return;
      }
      const maxLastPlayer = this.getMaxPlayers(allPlayer);
      this.winner.push(maxLastPlayer);
      if (this.getLeftoverPot() > 0) {
        getOtherWinner([ ...excludePlayers, ...maxLastPlayer ]);
      }
    };
    getOtherWinner([]);
  }

  /**
   * Set players
   * @param {IPlayer[]} users
   * @returns {Link<Player>}
   */
  setPlayer(users: IPlayer[]) {
    console.log('init player ======================================================', users);
    users.forEach((u, position) => {
      const player = new Player({
        ...u,
        position,
      });
      this.allPlayer.push(player);
    });
    return new Link<Player>(this.allPlayer);
  }

  /**
   * Get in the game players
   * @param {string} type - 'all': include allin players
   * @param {Player[]} excludePlayers - exclude player
   * @returns {any[]}
   */
  getPlayers(type= 'all', excludePlayers?: Player[]) {
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
    return excludePlayers ? players.filter(p => {
      const isNotPlayer = excludePlayers.filter(excludePlayer => excludePlayer.userId === p.userId
        || excludePlayer.evPot >= p.evPot);
      return isNotPlayer.length === 0;
    }) : players;
  }

  /**
   * Get player poker max poker style
   */
  getPlayerPokerStyle() {
    this.allPlayer.map(p => {
      p.pokerStyle = new PokerStyle([ ...p.getHandCard(), ...this.commonCard ], this.isShort).getPokerWeight();
      return p;
    });
  }

  /**
   * Counting allin player slide pot
   * @returns {number}
   */
  getLeftoverPot() {
    if (this.winner.length === 0) {
      return this.pot;
    }
    return this.pot - this.winner[this.winner.length - 1][0].evPot;
  }

  /**
   * Get max players with player poker style weight
   * @param {Player[]} lastPlayers
   * @returns {Player[]}
   */
  getMaxPlayers(lastPlayers: Player[]) {
    const _maxPlayers: Player[] = [];
    const maxPlayer = lastPlayers.reduce((acc, cur) => {
      return this.compareCard(acc, cur) === 1 ? acc : cur;
    });
    // has many winner equal max player
    lastPlayers.forEach(p => {
      if (this.compareCard(p, maxPlayer) === 0) {
        _maxPlayers.push(p);
      }
    });
    return _maxPlayers;
  }

  /**
   * Find next round first action player,
   * if small blind is already fold, then next in the game player
   * @returns {ILinkNode<Player>}
   */
  getFirstActionPlayer() {
    const player = this.allPlayer.filter(p => p.counter > 0
      && p.position !== 0 && p.actionCommand !== 'fold')[0];
    console.log('getFirstActionPlayer-------player', player);
    let link: ILinkNode<Player> | null = this.playerLink.link;
    for (let i = 0; i < this.playerSize; i++) {
      if (link?.node.userId === player?.userId) {
        return link;
      }
      link = link?.next as ILinkNode<Player>;
    }
    return link;
  }

  /**
   * Set game state
   */
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

  /**
   * Set hand cards
   */
  setHandCard() {
    // send card start by small blind
    let playerLink = this.playerLink.link;
    let player: Player;
    for (let i = 0; i < 2; i++) {
      let j = 0;
      while (j < this.playerSize) {
        player = playerLink.node;
        player.setHandCard(this.poker.getCard());
        if (playerLink.next) {
          playerLink = playerLink.next;
        }
        j++;
      }
    }
  }

  /**
   * Play game
   */
  play() {
    this.status = EGameStatus.GAME_START;
    this.sendCard();
  }

  /**
   * Start next action round
   */
  startActionRound() {
    this.actionTimeOut = setTimeout(async () => {
      const userId = this.currPlayer.node.userId || '';
      console.log('userId start', userId);
      this.action('fold');
      this.autoActionCallBack('fold', userId);
    }, ACTION_TIME);
  }

  /**
   * player action
   * @param {string} commandString - player action command string, include 'call', 'fold', 'raise:xxx(size)', 'allin', 'check'
   */
  action(commandString: string) {
    if (this.status === EGameStatus.GAME_ACTION && this.currPlayer.next) {
      const commands = commandString.split(':');
      const command = commands[0];
      let size = Number(commands[1]);
      if (command === ECommand.ALL_IN) {
        // Counting player action size, if player's counter less than prevSize then use prevSize
        size = this.currPlayer.node.counter > this.prevSize ?
          this.currPlayer.node.counter : this.prevSize;
        this.currActionAllinPlayer.push(this.currPlayer.node);
        this.removePlayer(this.currPlayer.node);
        this.pot += this.currPlayer.node.counter;
      }
      if (command === ECommand.CALL) {
        size = this.prevSize;
        const actionSize = this.currPlayer.node.actionSize >= 0 ? this.currPlayer.node.actionSize : 0;
        console.log('call----------', actionSize);
        this.pot += size - actionSize;
      }
      if (command === ECommand.FOLD) {
        this.removePlayer(this.currPlayer.node);
      }
      if (command === ECommand.CHECK) {
        // prev player must be check
        if (!(this.prevSize <= 0 ||
          ((this.currPlayer.node.type === EPlayerType.BIG_BLIND
            || this.playerSize === 2 && this.currPlayer.node.type === EPlayerType.DEALER)
            && this.prevSize === this.smallBlind * 2))) {
          throw 'incorrect action: check';
        }
        console.log(this.currPlayer.node.type === EPlayerType.BIG_BLIND
          && this.prevSize === this.smallBlind * 2, 'big blind', this.currPlayer);
        size = -1;
      }
      if (command === ECommand.RAISE) {
        // counter not enough raise
        if ((size + this.currPlayer.node.actionSize) < this.prevSize * 2) {
          throw `incorrect action: raise ========= action size: ${this.currPlayer.node.actionSize}, prevSize: ${this.prevSize}`;
        }
        this.pot += size;
        // 3 bet
        size += this.currPlayer.node.actionSize;
      }
      try {
        clearTimeout(this.actionTimeOut);
        this.currPlayer.node.action(commandString, this.prevSize);
        const nextPlayer = this.currPlayer.next.node;
        // all check actionSize === -1
        // all player allin
        // only 2 player, curr player fold, next player alrecommand add errorady action
        // only one player ,one player fold,other player allin
        // pre flop big blind check and other player call
        // pre flop big blind fold and other player call
        if (this.playerSize === 0
          || (this.playerSize === 1 && this.currActionAllinPlayer.length === 0)
          || (this.commonCard.length !== 0 && nextPlayer.actionSize === this.smallBlind * 2 && nextPlayer.actionSize === size)
          || (nextPlayer.actionSize === this.prevSize
            && (nextPlayer.actionSize === size || command === ECommand.FOLD)
          && this.prevSize !== this.smallBlind * 2 && this.prevSize !== 0)
          || (this.commonCard.length === 0
            && (nextPlayer.actionSize === this.smallBlind * 2 && this.prevSize === nextPlayer.actionSize)
            && (this.currPlayer.node.type === EPlayerType.BIG_BLIND
              || (this.allPlayer.length === 2 && this.currPlayer.node.type === EPlayerType.DEALER))
            && (command === ECommand.CHECK || command === ECommand.FOLD))) {
          console.log('actionComplete');
          this.actionComplete();
          return;
        }
        this.prevSize = command === ECommand.FOLD ? this.prevSize : size;
        this.currPlayer = this.currPlayer.next;
        // action time out, auto action fold
        this.actionTimeOut = setTimeout(() => {
          const actionType = 'fold';
          const userId = this.currPlayer.node.userId;
          this.action(actionType);
          this.autoActionCallBack(actionType, userId);
        }, ACTION_TIME);
      } catch (e) {
        throw 'action:' + e;
      }
    } else {
      throw 'incorrect action flow';
    }
  }

  /**
   * Action is complete, collet allin player, clear player action, enter the next round
   */
  private actionComplete() {
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
        console.log('evPot--------------------', this.prevPot, currAllinPlayerPot);
        allinPlayer.evPot = this.prevPot + currAllinPlayerPot;
        currAllinPlayerPot = 0;
      });
      this.allInPlayers = [ ...this.allInPlayers, ...this.currActionAllinPlayer ];
      this.allInPlayers.sort((prev, next) => prev.evPot - next.evPot);
      console.log('currActionAllinPlayer--------------------', this.allInPlayers, this.currActionAllinPlayer);
      // slide pot
      this.allInPlayers.forEach((p, key) => {
        if (key === 0) {
          this.slidePots.push(p.evPot);
        } else {
          this.slidePots.push(p.evPot - this.allInPlayers[key - 1].evPot);
        }
      });
    }
    // action complete clear player actionSize = 0
    this.clearPlayerAction();
    this.currActionAllinPlayer = [];
    this.prevSize = 0;
    this.prevPot = this.pot;
    // new action ring first action is sb
    this.currPlayer = this.getFirstActionPlayer();
    this.setSate();
    console.log(this.playerSize, 'playerS-------3', this.playerLink);
    if (this.status === EGameStatus.GAME_SHOWDOWN || this.playerSize <= 1) {
      setTimeout(() => {
        this.gameOver();
      }, 300);
    }
    this.actionRoundComplete();
  }

  /**
   * Send common card or hand card
   */
  sendCard() {
    if (this.status === EGameStatus.GAME_START) {
      this.setHandCard();
      this.setSate();
      return;
    }
    if (this.status === EGameStatus.GAME_FLOP) {
      // fire card
      this.poker.getCard();
      for (let i = 0; i < 3; i++) {
        this.commonCard.push(this.poker.getCard());
      }
      this.setSate();
      return;
    }
    if (this.status === EGameStatus.GAME_TURN || this.status === EGameStatus.GAME_RIVER) {
      // fire card
      this.poker.getCard();
      this.commonCard.push(this.poker.getCard());
      this.setSate();
      return;
    }
    throw 'error flow sendCard';
  }

  /**
   * Comparison player cards style, base on poker style weight
   * @param {Player} player - first player
   * @param {Player} targetPlayer - second player
   * @returns {number} - target player, bigger: -1, equal: 0, less than: 1
   */
  compareCard(player: Player, targetPlayer: Player) {
    const firstWeight = player.pokerStyle;
    const lastWeight = targetPlayer.pokerStyle;
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

  /**
   * Clear all player action size and action command
   */
  private clearPlayerAction() {
    this.allPlayer.forEach(player => {
      player.clearActionSize();
    });
  }

  /**
   * Game over, init player
   */
  public initPlayer() {
    this.allPlayer.forEach(player => {
      player.type = '';
      player.actionSize = 0;
      player.actionCommand = '';
    });
  }

  /**
   * remove player from player link
   * @param {Player} currPlayer
   */
  removePlayer(currPlayer: Player) {
    let playerLink = this.playerLink.link;
    let player: ILinkNode<Player>;
    while (playerLink.next) {
      player = playerLink.next;
      if (currPlayer.userId === player.node.userId) {
        const nextNext = playerLink.next.next;
        // player.next = null;
        playerLink.next = nextNext;
        this.playerSize--;
        this.playerLink.link = playerLink;
        return;
      }
      playerLink = playerLink.next;
    }
  }

  /**
   * Counting winner Pot
   */
  counting() {
    let prevEvPot = 0;
    this.winner.forEach((winnerList, key) => {
      if (key !== 0) {
        prevEvPot = this.winner[key - 1][0].evPot;
      }
      winnerList.forEach(winner => {
        const pot = winner.evPot === Infinity ? this.pot : winner.evPot;
        winner.setIncome((pot - prevEvPot) / winnerList.length);
      });
    });
  }

  /**
   * Game over
   */
  gameOver() {
    console.log('game over------------------');
    // only one player,other fold
    this.getWinner();
    // todo counting
    this.counting();
    this.initPlayer();
    this.gameOverCallBack();
  }
}
