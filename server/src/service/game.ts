import { Context, inject, plugin, provide } from 'midway';
import { IGame, IGameService } from '../interface/IGame';

@provide('GameService')
export class GameService implements IGameService {

  @inject()
  ctx: Context;

  @plugin()
  mysql: any;

  async add(game: IGame) {
    console.log('this.mysql', this.mysql);
    const gameInfo = await this.mysql.insert('game', {
      room_id: game.roomId,
      status: game.status,
      common_card: game.commonCard,
      pot: game.pot,
      winners: game.winners,
    });
    console.log(gameInfo);
    return { succeed: gameInfo.affectedRows === 1, id: gameInfo.insertId };
  }

  async update(game: IGame) {
    const gameInfo = await this.mysql.update('game', {
      id: game.id,
      status: game.status,
      common_card: game.commonCard,
      pot: game.pot,
      winners: game.winners,
    });
    console.log(gameInfo);
    return { succeed: gameInfo.affectedRows === 1 };
  }

  async findById(gid: number): Promise<IGame> {
    return await this.mysql.get('game', { id: gid });
  }
}
