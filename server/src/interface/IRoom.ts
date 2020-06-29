export interface IRoom {
  roomNumber?: string;
  isShort: boolean;
  time?: number;
  smallBlind: number;
}

export interface IRoomService {
  findById(uid: string): Promise<IRoom>;
  findRoomNumber(roomNumber: string): Promise<IRoom>;
  findByRoomNumber(roomNumber: string): Promise<boolean>;
  add(isShort: boolean, smallBlind: number, time?: number): Promise<any>;
  // join(roomNumber: string, userName: string): void;
  // leave(roomNumber: string, message: string): void;
}
