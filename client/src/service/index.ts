import request from '../utils/request';

export default {
  register: ({ userAccount = '', password = '', nickName = '' }) => request({
    url: '/user/register',
    body: { userAccount, password, nickName },
  }),
  login: (userAccount: string, password: string ) => request({
    url: '/user/login',
    body: { userAccount, password },
  }),
  checkLogin: () => request({
    url: '/user',
    body: {},
  }),
  createRoom: (isShort: boolean, smallBlind: number, time: number) => request({
    url: '/game/room',
    body: { isShort, smallBlind, time },
  }),
  findRoom: (roomNumber: string) => request({
    url: '/game/room/find',
    body: { roomNumber },
  }),
  buyIn: (buyInSize: number) => request({
    url: '/game/buyIn',
    body: { buyInSize },
  }),
  recordList: (roomNumber: string) => request({
    url: '/game/record/find',
    body: { roomNumber },
  }),
};
