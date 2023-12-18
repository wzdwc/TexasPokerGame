import { EggLogger } from 'egg';
import { FullRecord } from '../interface/FullRecord';

export const fullRecord: FullRecord = { actions: [], players: [] };

export function saveFullRecordAndClean(logger: EggLogger, args: { roomNumber: string }) {
  // 使用日志进行记录
  logger.info(`room:${args.roomNumber}`, JSON.stringify(fullRecord));
  fullRecord.actions = [];
  fullRecord.players = [];
}
