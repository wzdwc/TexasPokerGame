import { Inject, Controller, Get, Post, Provide } from '@midwayjs/core';
import { Context } from '@midwayjs/web';
import BaseController from '../../lib/baseController';
import { IRoomService } from '../../interface/IRoom';

@Provide()
@Controller('/node/game/room')
export class RoomController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject('RoomService')
  roomService: IRoomService;

  @Post('/')
  async index() {
    try {
      const { body } = this.getRequestBody();
      const result = await this.roomService.add(body.isShort, body.smallBlind);
      this.success(result);
    } catch (e) {
      this.fail('create room error');
      console.log(e);
    }
  }

  @Post('/find')
  async find() {
    try {
      const { body } = this.getRequestBody();
      const result = await this.roomService.findRoomNumber(body.roomNumber);
      this.success({ ...result });
    } catch (e) {
      this.fail('invalid room');
      console.log(e);
    }
  }

  @Get('/')
  async getRooms() {
    try {
      const result = await this.roomService.getRooms(3);
      this.success({ ...result });
    } catch (e) {
      this.fail('fetch rooms error');
      console.log(e);
    }
  }
}
