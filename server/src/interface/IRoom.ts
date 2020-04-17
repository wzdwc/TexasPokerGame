export interface IRoom {
  roomNumber: string;
}

export interface IRoomService {
  findById(uid: string): Promise<IRoom>;
  findByRoomNumber(roomNumber: number): Promise<boolean>;
  add(): Promise<any>;
  // join(roomNumber: string, userName: string): void;
  // leave(roomNumber: string, message: string): void;
}
