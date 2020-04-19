import { Context, inject, plugin, provide } from 'midway';
import { IGame, IGameService } from '../interface/IGame';

@provide('GameService')
export class GameService implements IGameService {

  @inject()
  ctx: Context;

  @plugin()
  mysql: any;

  async add(game: IGame) {
    return await this.mysql.insert('game', {
      ...game,
    });
  }

  async findById(gid: number): Promise<IGame> {
    return await this.mysql.get('game', { id: gid });
  }
}
