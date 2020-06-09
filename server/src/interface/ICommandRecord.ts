
export interface ICommandRecord {
  roomId: string;
  gameId: number;
  userId: string;
  type: string;
  gameStatus: number;
  command: string;
  counter: number;
}

export interface ICommandRecordService {
  findById(gid: number): Promise<ICommandRecord>;

  add(commandRecord: ICommandRecord): Promise<any>;
}
