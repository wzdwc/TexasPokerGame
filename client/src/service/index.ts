import request from '../utils/request';

export default {
  register: (userName: string, password: string) => request({
    url: '',
    body: { userName, password },
  }),
};
