export interface IPlayerDTO {
  roomNumber: number;
  userId: string;
  counter: number;
  gameId: number;
  handCard: string;
  buyIn: number;
}

export interface IPlayerService {
  findByRoomNumber(roomNumber: number): Promise<IPlayerDTO []>;

  add(gameRecord: IPlayerDTO): Promise<any>;
}
