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
  commandList: ICommandRecord [];
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

  @post('/find/commandRecord')
  async find() {
    try {
      const { body } = this.getRequestBody();
      const state = this.ctx.state;
      const commandList = await this.commandService.findByRoomNumber(body.gameId);
      const gameList = await this.gameService.findByRoomNumber(body.roomNumber);
      let result: IFindGameRecord;
      console.log(state, 'user');
      gameList.forEach(g => {
        if (g.status === EGameOverType.GAME_OVER) {
          const winner = JSON.parse(g.winners || '')[0][0];
          delete winner.handCard;
          g.winners = JSON.stringify([[ winner ]]);
        }
      });
      commandList.forEach(c => {
        if (c.userId !== state.user.user.userId) {
          c.handCard = '';
        }
      });
      result = {
        commandList,
        winners: gameList.find(g => g.id === body.gameId)?.winners || '',
        gameId: body.gameId,
      };
      this.success({
        ...result,
      });
    } catch (e) {
      this.fail('invalid game record');
      console.log(e);
    }
  }

  @post('/find/gameRecord')
  async index() {
    try {
      const { body } = this.getRequestBody();
      const gameList = await this.gameService.findByRoomNumber(body.roomNumber);
      const result = gameList.map(g => Object.assign({}, {}, { gameId: g.id }));
      this.success({
        ...result,
      });
    } catch (e) {
      this.fail('create room error');
      console.log(e);
    }
  }
}
