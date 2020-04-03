import { Context } from 'egg';
import { IFetchOptions } from '../interface/IFetchOptions';
import { inject, config } from 'midway';

export default class BaseService {
  @inject()
  protected ctx: Context;

  @config('apiDomain')
  protected apiDomainConfig: any;

  /**
   * 处理请求
   * @param {IFetchOptions} option
   * @returns {Promise<any>}
   */
  public async fetch(option: IFetchOptions) {
    try {
      const data = {
        head: { ...option.head },
        body: { ...option.body },
      };
      // 用户登录标识
      const headers = {
        Authorization: `Bearer ${option.ssjToken}`,
      };
      const ajaxUrl = this.apiDomainConfig.loanDomain + option.url;
      // 发起服务请求
      const result = await this.ctx.curl(ajaxUrl, {
        data,
        type: option.type || 'POST',
        headers,
        dataType: 'json',
      });
      // 接口请求失败日志上报
      if (result.status !== 200) {
        this.ctx.logger.error(this.ctx.getLogs());
      }
      return result.data;
    } catch (e) {
      this.ctx.logger.error(this.ctx.getLogs());
    }
  }

}
