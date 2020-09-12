import { IPlayerDTO, IPlayerService } from '../interface/IPlayer';
import { Context, inject, plugin, provide } from 'midway';

@provide('PlayerRecordService')
export class PlayerService implements IPlayerService {

  @inject()
  ctx: Context;

  @plugin()
  mysql: any;

  async add(gameRecord: IPlayerDTO) {
    return await this.mysql.insert('player', {
      ...gameRecord,
    });
  }

  async findByRoomNumber(roomNumber: number): Promise<IPlayerDTO []> {
    const result = await this.mysql.select('player', {
      where: { roomNumber },
    });
    console.log(result);
    return result ? JSON.parse(JSON.stringify(result)) : [];
  }
}
