import { IGameRecord, IGameRecordService } from '../interface/IGameRecord';
import { Context, inject, plugin, provide } from 'midway';

@provide('GameRecordService')
export class GameRecordService implements IGameRecordService {

  @inject()
  ctx: Context;

  @plugin()
  mysql: any;

  async add(gameRecord: IGameRecord) {
    return await this.mysql.insert('game_record', {
      ...gameRecord,
    });
  }

  async findById(gid: number): Promise<IGameRecord> {
    return await this.mysql.get('game_record', { id: gid });
  }
}
