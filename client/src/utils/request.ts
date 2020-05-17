import axios, {AxiosRequestConfig, Method} from 'axios';
import cookie from 'js-cookie';

const request = async ({method = 'post' as Method, url = '', body = {}, timeout = 8000}) => {
  // const origin = 'http://www.jojgame.com:7001/node';
  const origin = 'http://192.168.0.110:7001/node';
  // const origin = 'http://172.22.72.70:7001/node';
  if (!url) {
    return Promise.reject('Request url is null!');
  }
  const token = cookie.get('token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  url = `${origin}${url}`;
  const option: AxiosRequestConfig = {
    url,
    method,
    timeout,
    data: body,
    withCredentials: true,
    headers,
  };
  try {
    const result = await axios(option);
    if (result.data.code === '000000') {
      return result.data;
    } else {
      throw result.data;
    }
  } catch (e) {
    throw e;
  }
};
export default request;
