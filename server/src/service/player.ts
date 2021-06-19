import {
  IPlayerDTO,
  IPlayerService,
  UpdatePlayerDTO,
} from '../interface/IPlayer';
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

  async update(updatePlayer: UpdatePlayerDTO) {
    const row = {
      id: updatePlayer.playerId,
      counter: updatePlayer.counter,
    };
    return await this.mysql.update('player', row);
  }

  async findByRoomNumber(roomNumber: number): Promise<IPlayerDTO []> {
    const result = await this.mysql.select('player', {
      where: { roomNumber },
    });
    console.log(result);
    return result ? JSON.parse(JSON.stringify(result)) : [];
  }
}
