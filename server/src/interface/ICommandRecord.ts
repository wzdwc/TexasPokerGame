
export interface ICommandRecord {
  roomNumber: string;
  gameId: number;
  userId: string;
  type: string;
  pot: number;
  commonCard: string;
  handCard?: string;
  gameStatus: number;
  command: string;
  counter: number;
}

export interface ICommandRecordService {
  findById(gid: number): Promise<ICommandRecord>;
  findByRoomNumber(gameId: number): Promise<ICommandRecord[]>;
  add(commandRecord: ICommandRecord): Promise<any>;
}
