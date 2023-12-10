export interface IRoom {
  roomNumber?: string;
  isShort: boolean;
  time?: number;
  smallBlind: number;
}

export interface IRoomBasicInfo {
  roomNumber: string;
  createdAt: number;
  playersNickName: string;
}
