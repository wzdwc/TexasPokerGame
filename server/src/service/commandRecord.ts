import { Context, inject, plugin, provide } from 'midway';
import {
  ICommandRecord,
  ICommandRecordService,
} from '../interface/ICommandRecord';

@provide('CommandRecordService')
export class CommandRecord implements ICommandRecordService {

  @inject()
  ctx: Context;

  @plugin()
  mysql: any;

  async add(commandRecord: ICommandRecord) {
    return await this.mysql.insert('command_record', {
      room_id: commandRecord.roomId,
      game_id: commandRecord.gameId,
      command: commandRecord.command,
      type: commandRecord.type,
      user_id: commandRecord.userId,
      counter: commandRecord.counter,
      game_status: commandRecord.gameStatus,
    });
  }

  async findById(gid: number): Promise<ICommandRecord> {
    return await this.mysql.get('game_record', { id: gid });
  }
}
