import { Context, inject, controller, post, provide } from 'midway';
import BaseController from '../../lib/baseController';
import { IPlayerService } from '../../interface/IPlayer';
import {
  ICommandRecord,
  ICommandRecordService,
} from '../../interface/ICommandRecord';
import { IGameService } from '../../interface/IGame';
import { EGameOverType } from '../core/PokerGame';

interface IFindGameRecord {
  gameId: number;
  winners: string;
  handCard: string;
  gameInfo: ICommandRecord [];
}

@provide()
@controller('/node/game/record')
export class GameRecordController extends BaseController {

  @inject()
  ctx: Context;

  @inject('PlayerRecordService')
  playerService: IPlayerService;

  @inject('GameService')
  gameService: IGameService;

  @inject('CommandRecordService')
  commandService: ICommandRecordService;

  @post('/find')
  async find() {
    try {
      const { body } = this.getRequestBody();
      const state = this.ctx.state;
      const playerList = await this.playerService.findByRoomNumber(body.roomNumber);
      const commandList = await this.commandService.findByRoomNumber(body.roomNumber);
      const gameList = await this.gameService.findByRoomNumber(body.roomNumber);
      const result: IFindGameRecord [] = [];
      console.log(state, 'user');
      gameList.forEach(g => {
        if (g.status === EGameOverType.GAME_OVER) {
          const winner = JSON.parse(g.winners || '')[0][0];
          delete winner.handCard;
          g.winners = JSON.stringify([[ winner ]]);
        }
        const dateItem: IFindGameRecord = {
          gameId: g.id || 0,
          winners: JSON.parse(g.winners || ''),
          handCard: playerList.find(p => state.user.user.userId !== p.userId)?.handCard || '',
          gameInfo: commandList.filter(c => c.gameId === g.id) || [],
        };
        result.push(dateItem);
      });

      this.success({
        result,
      });
    } catch (e) {
      this.fail('invalid game record');
      console.log(e);
    }
  }

  @post('/')
  async index() {
    try {
      this.success({
        test: '1111',
      });
    } catch (e) {
      this.fail('create room error');
      console.log(e);
    }
  }
}
