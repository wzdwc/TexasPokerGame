import request from '../utils/request';

export default {
  register: (userName: string, password: string) => request({
    url: '/user/register',
    body: { userName, password },
  }),
  login: (userAccount: string, password: string) => request({
    url: '/user/login',
    body: { userAccount, password },
  }),
  createRoom: () => request({
    url: '/game/room',
    body: { },
  }),
  buyIn: (buyInSize: number) => request({
    url: '/game/buyIn',
    body: { buyInSize },
  }),
};
