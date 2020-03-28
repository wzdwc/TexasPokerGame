import { inject, Context } from 'midway';
import { IRequestBody } from '../interface/IRequestBody';
import {IResult, ResultCode} from "../interface/IResult";

export default class BaseController {

  @inject()
  protected ctx: Context;

  /**
   * 获取请求内容
   * @returns {IRequestBody}
   */
  public getRequestBody(): IRequestBody {
    let params: IRequestBody;
    params = this.ctx.request.body.params && JSON.parse(this.ctx.request.body.params) || {};
    console.log(this.ctx.request.body, 'params');
    return params;
  }

  /**
   * 失败回调封装
   * @param {Object} data
   */
  public success(data: any) {
    const result: IResult = {
      code: ResultCode.SUCCESS,
      data: data,
      message: 'successful'
    }
    this.ctx.body = result
  }
  /**
   * 错误回调封装
   * @param {string} message
   */
  public fail(message: string) {
    const result: IResult = {
      code: ResultCode.FAILD,
      data: {},
      message
    };
    this.ctx.body = result
  }
}
