import axios, {AxiosRequestConfig, Method} from 'axios';
import cookie from 'js-cookie';
import origin from '@/utils/origin';

const request = async ({method = 'post' as Method, url = '', body = {}, timeout = 8000}) => {
  if (!url) {
    return Promise.reject('Request url is null!');
  }
  const token = cookie.get('token') || localStorage.getItem('token');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  console.log('url', origin.url);
  url = `${origin.url}/node${url}`;
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
