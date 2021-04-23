import { Context, inject, provide, plugin } from 'midway';
import { IRoom, IRoomService } from '../interface/IRoom';

@provide('RoomService')
export default class RoomService implements IRoomService {

  @inject()
  ctx: Context;

  @plugin()
  mysql: any;

  @plugin()
  redis: any;

  async findById(uid: string): Promise<IRoom> {
    return await this.mysql.get('room', { id: uid });
  }

  async findRoomNumber(roomNumber: string): Promise<IRoom> {
    const result = await this.mysql.get('room', { roomNumber });
    return {
      isShort: !!result.isShort,
      smallBlind: result.smallBlind,
      time: result.time,
    };
  }

  async findByRoomNumber(number: string): Promise<boolean> {
    const roomNumber = await this.redis.get(`room:${number}`);
    return !!roomNumber;
  }

  async add(isShort: boolean, smallBlind: number, expires: number = 360000) {
    const number = Math.floor(Math.random() * (1000000 - 100000)) + 100000;
    const result = await this.mysql.insert('room', {
      roomNumber: number,
      time: expires,
      isShort,
      smallBlind,
    });
    const roomRedis = await this.redis.set(`room:${number}`, `${number}`, 'ex', expires);
    if (result.affectedRows === 1 && roomRedis === 'OK') {
      return { roomNumber: number };
    } else {
      throw 'room add error';
    }
  }
}
