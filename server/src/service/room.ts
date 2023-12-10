import { Inject, Plugin, Provide } from '@midwayjs/core';
import { Context } from '@midwayjs/web';
import { IRoom, IRoomService, IRoomBasicInfo } from '../interface/IRoom';
import { IGameRoom } from '../interface/IGameRoom';

const KeyPrefix = 'room';

@Provide('RoomService')
export default class RoomService implements IRoomService {
  @Inject()
  ctx: Context;

  @Plugin()
  mysql: any;

  @Plugin()
  redis: any;

  async findById(uid: string): Promise<IRoom> {
    return await this.mysql.get('room', { id: uid });
  }

  /**
   * 按时间倒序排列, 返回前 ${size} 条 room 记录
   * 包含, roomNumber, 创建时间, 坐下的玩家的 nickName
   * @param size
   * @returns
   */
  async getRooms(size: number): Promise<IRoomBasicInfo[]> {
    const roomNumbersRet: string[] = await this.redis.keys(`${KeyPrefix}:*`);
    const roomNumbers = roomNumbersRet.map((e) => e.split(':')[1]);
    const availableRooms: { roomNumber: string; create_time: string }[] = await this.mysql.select('room', {
      where: { roomNumber: roomNumbers },
      columns: ['roomNumber', 'create_time'],
      orders: [['create_time', 'desc']],
      limit: size,
      offset: 0,
    });

    const app = this.ctx.app as any;
    const availableGameRooms = app.io.of('/socket').gameRooms;
    const ret: IRoomBasicInfo[] = [];
    availableRooms.forEach((r) => {
      const room: IGameRoom = availableGameRooms.find((room: IGameRoom) => room.number === r.roomNumber);
      if (!room) return;
      const sitPlayers = room.roomInfo.sit;
      const names = sitPlayers.map((sit) => sit.player?.nickName).filter(Boolean);
      ret.push({ roomNumber: r.roomNumber, createdAt: Number(r.create_time), playersNickName: names.join(',') });
    });
    return ret;
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
    const roomNumber = await this.redis.get(`${KeyPrefix}:${number}`);
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
    const roomRedis = await this.redis.set(`${KeyPrefix}:${number}`, `${number}`, 'ex', expires);
    if (result.affectedRows === 1 && roomRedis === 'OK') {
      return { roomNumber: number };
    } else {
      throw 'room add error';
    }
  }
}
