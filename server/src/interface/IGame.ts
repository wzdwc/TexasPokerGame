
export interface IGame {
  roomId: string;
  pot: string;
  status: number;
  commonCard: string;
}

export interface IGameService {
  findById(gid: number): Promise<IGame>;
  add(game: IGame): Promise<any>;
}
