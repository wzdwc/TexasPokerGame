export interface IRoom {
  roomNumber: string;
}

export interface IRoomService {
  findById(uid: string): IRoom;
  add(): Promise<any>;
}
