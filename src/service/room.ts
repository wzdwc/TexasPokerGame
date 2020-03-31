import BaseService from '../lib/baseService';
import {Context, inject, provide, plugin} from "midway";

@provide('RoomService')
export class RoomService extends BaseService {

  @inject()
  ctx: Context;

  @plugin()
  mysql: any;

  async findById(uid: string){
    const room = await this.mysql.get('room', { id: uid});
    return { room }
  }

  async add() {
    const number = Math.floor(Math.random() * (1000000 - 100000)) + 100000;
    return await this.mysql.insert('room', { roomNumber: number });
  }

}
