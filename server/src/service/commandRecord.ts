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
      ...commandRecord,
    });
  }

  async findById(gid: number): Promise<ICommandRecord> {
    return await this.mysql.get('game_record', { id: gid });
  }

  async findByRoomNumber(roomNumber: number): Promise<ICommandRecord []> {
    const result = await this.mysql.query('SELECT\n' +
      '\tcounter,\n' +
      '\tcommand,\n' +
      '\tnickName,\n' +
      '\ttype,\n' +
      '\tgameStatus,\n' +
      '\tcommonCard,\n' +
      '\tpot,\n' +
      '\tgameId\n' +
      'FROM\n' +
      '\tcommand_record\n' +
      'INNER JOIN USER ON `user`.id = command_record.userId\n' +
      'WHERE\n' +
      '\tcommand_record.roomNumber = ?', roomNumber);
    console.log(result, '=============command');
    return JSON.parse(JSON.stringify(result));
  }
}
