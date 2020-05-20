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
  createRoom: () => request({
    url: '/game/room',
    body: { },
  }),
  buyIn: (buyInSize: number) => request({
    url: '/game/buyIn',
    body: { buyInSize },
  }),
};
