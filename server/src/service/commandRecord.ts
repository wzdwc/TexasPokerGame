import { Inject, Plugin, Provide } from '@midwayjs/core';
import { Context } from '@midwayjs/web';
import { ICommandRecord, ICommandRecordService } from '../interface/ICommandRecord';

@Provide('CommandRecordService')
export class CommandRecord implements ICommandRecordService {
  @Inject()
  ctx: Context;

  @Plugin()
  mysql: any;

  async add(commandRecord: ICommandRecord) {
    const result = await this.mysql.insert('command_record', {
      ...commandRecord,
    });
    return { succeed: result.affectedRows === 1 };
  }

  async findPast7DayGameIDsByUserID(userID: number): Promise<number[]> {
    const result = await this.mysql.query(
      'SELECT\n' +
        'DISTINCT gameId\n' +
        'FROM command_record\n' +
        'WHERE userId = ?\n' +
        'AND create_time >= DATE_SUB(now(),interval 7 DAY)',
      [userID],
    );
    const recordList = JSON.parse(JSON.stringify(result));
    if (recordList) {
      return recordList.map((item: ICommandRecord) => {
        return item.gameId;
      });
    }
    return [];
  }

  async findByGameIDs(gameIDs: number[]): Promise<ICommandRecord[]> {
    const result = await this.mysql.select('command_record', {
      where: {
        gameId: gameIDs,
      },
    });
    return JSON.parse(JSON.stringify(result));
  }

  async findByGameID(gameID: number): Promise<ICommandRecord[]> {
    const result = await this.mysql.query(
      'SELECT\n' +
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
        'INNER JOIN player ON player.userId = command_record.userId\n' +
        '\twhere command_record.gameId = ? and player.gameId = ?',
      [gameID, gameID],
    );
    console.log(result, '=============command');
    return JSON.parse(JSON.stringify(result));
  }
}
