import axios, { AxiosRequestConfig, Method } from "axios";
import cookie from "js-cookie";
import origin from "@/utils/origin";
import { ResultCode, IResult } from "@/interface/IResult";

const request = async ({
  method = "post" as Method,
  url = "",
  body = {},
  timeout = 8000,
}): Promise<IResult> => {
  if (!url) {
    return Promise.reject("Request url is null!");
  }
  const token = cookie.get("token") || localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  url = `${origin.urls[0]}/node${url}`;
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
    if (result.data.code === ResultCode.SUCCESS) {
      return result.data;
    } else {
      throw result.data;
    }
  } catch (e) {
    throw e;
  }
};
export default request;
