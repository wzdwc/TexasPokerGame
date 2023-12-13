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
  findByGameID(gameID: number): Promise<ICommandRecord[]>;
  findByGameIDs(gameIDs: number[]): Promise<ICommandRecord[]>;
  add(commandRecord: ICommandRecord): Promise<any>;
  findPast7DayGameIDsByUserID(userID: number): Promise<number[]>;
}
