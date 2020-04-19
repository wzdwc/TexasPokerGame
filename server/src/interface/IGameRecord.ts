export interface IGameRecord {
  room_number: number;
  user_id: number;
  game_id: number;
  hand_cards: string;
  buy_in: number;
}

export interface IGameRecordService {
  findById(gid: number): Promise<IGameRecord>;

  add(gameRecord: IGameRecord): Promise<any>;
}
