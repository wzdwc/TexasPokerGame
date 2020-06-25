
export interface ICommandRecord {
  roomNumber: string;
  gameId: number;
  userId: string;
  type: string;
  pot: number;
  commonCard: string;
  gameStatus: number;
  command: string;
  counter: number;
}

export interface ICommandRecordService {
  findById(gid: number): Promise<ICommandRecord>;
  findByRoomNumber(roomNumber: number): Promise<ICommandRecord[]>;
  add(commandRecord: ICommandRecord): Promise<any>;
}
