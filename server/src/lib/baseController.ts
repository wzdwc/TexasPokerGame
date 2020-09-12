import { inject, Context } from 'midway';
import { IResult, ResultCode } from '../interface/IResult';

export default class BaseController {

  @inject()
  protected ctx: Context;

  /**
   * 获取请求内容
   * @returns {IRequestBody}
   */
  public getRequestBody() {
    // let params: IRequestBody;
    // params = this.ctx.request.body.params && JSON.parse(this.ctx.request.body.params) || {};
    // console.log(this.ctx.request.body, 'params');
    console.log(this.ctx.request, 'request');
    return this.ctx.request;
  }

  /**
   * 失败回调封装
   * @param {Object} data
   */
  public success(data: any) {
    const result: IResult = {
      code: ResultCode.SUCCESS,
      data,
      message: 'successful',
    };
    this.ctx.body = result;
  }
  /**
   * 错误回调封装
   * @param {string} message
   */
  public fail(message: string) {
    const result: IResult = {
      code: ResultCode.FAIL,
      data: {},
      message,
    };
    this.ctx.body = result;
  }
}
