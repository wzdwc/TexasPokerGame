import axios, { AxiosRequestConfig, Method } from 'axios';
import cookie from 'js-cookie';
const request = async ({ method = 'post' as Method, url = '', body= {}, timeout = 8000 }) => {
  const origin = '';
  if (!url) {
    return Promise.reject('Request url is null!');
  }
  const token = cookie.get('game_token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  url = `${origin}/${url}`;
  const option: AxiosRequestConfig = {
    url,
    method,
    timeout,
    withCredentials: true,
    headers,
  };
  try {
    return await axios(option);
  } catch (e) {
    throw e;
  }
};
export default request;
