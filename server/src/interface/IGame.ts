export interface IGame {
  id?: number;
  roomNumber?: string;
  pot: number;
  status: number;
  commonCard: string;
  winners?: string;
}

export interface IGameService {
  findByID(gid: number): Promise<IGame>;
  findByIDs(ids: number[]): Promise<IGame[]>;
  findByRoomNumber(roomNumber: number): Promise<IGame[]>;
  add(game: IGame): Promise<any>;
  update(game: IGame): Promise<any>;
}
