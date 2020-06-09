
export interface IGame {
  id?: number;
  roomId?: string;
  pot: number;
  status: number;
  commonCard: string;
  winners?: string;
}

export interface IGameService {
  findById(gid: number): Promise<IGame>;
  add(game: IGame): Promise<any>;
  update(game: IGame): Promise<any>;
}
