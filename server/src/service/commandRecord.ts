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
    const result = await this.mysql.insert('command_record', {
      ...commandRecord,
    });
    return { succeed: result.affectedRows === 1 };
  }

  async findById(gid: number): Promise<ICommandRecord> {
    return await this.mysql.get('game_record', { id: gid });
  }

  async findByRoomNumber(gameId: number): Promise<ICommandRecord []> {
    const result = await this.mysql.query('SELECT\n' +
      '\tcommand_record.counter,\n' +
      '\tcommand_record.gameStatus,\n' +
      '\tcommand,\n' +
      '\thandCard,\n' +
      '\ttype,\n' +
      '\tcommonCard,\n' +
      '\tpot,\n' +
      '\tcommand_record.userId,\n' +
      '\t`user`.nickName\n' +
      'FROM\n' +
      '\tcommand_record\n' +
      'INNER JOIN `user` ON `user`.id = command_record.userId\n' +
      'INNER JOIN `player` ON `player`.userId = command_record.userId\n' +
      '\tcommand_record.gameId = ? and player.gameId = ?', [ gameId, gameId ]);
    console.log(result, '=============command');
    return JSON.parse(JSON.stringify(result));
  }
}
