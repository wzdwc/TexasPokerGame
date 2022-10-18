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
      ...game,
    });
    console.log(gameInfo);
    return { succeed: gameInfo.affectedRows === 1, id: gameInfo.insertId };
  }

  async update(game: IGame) {
    const gameInfo = await this.mysql.update('game', {
      ...game,
    });
    console.log(gameInfo);
    return { succeed: gameInfo.affectedRows === 1 };
  }

  async findByID(gid: number): Promise<IGame> {
    return await this.mysql.get('game', { id: gid });
  }

  async findByIDs(ids: number[]): Promise<IGame[]> {
    return await this.mysql.select('game', {
      where: { id: ids },
    });
  }

  async findByRoomNumber(roomNumber: number): Promise<IGame []> {
    const result = await this.mysql.select('game', {
      where: { roomNumber },
    });
    console.log(result, 'game -======================');
    return JSON.parse(JSON.stringify(result));
  }
}
