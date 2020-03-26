import { Context, EggAppConfig } from 'egg';

/**
 * elk 日志拦截中间件
 * @description 接口请求拦截，进行日志上报,根据config的环境配置，设置日志收集，prod默认开启
 * @param {EggAppConfig["elkLogger"]} options config 配置项 elkLogger
 * @returns {any}
 */
export default function elkLogger(options: EggAppConfig['elkLogger']): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    const { match, enable } = options;
    // 是否符合配置规则
    if (match(ctx) && enable) {
      ctx.setLogCollection('fetchStart', Date.now());
      ctx.setLogCollection('url', ctx.url);
      ctx.setLogCollection('requestBody', ctx.request.body);
      ctx.setLogCollection('message', `${ctx.request.method} ${ctx.url} info`);
      ctx.setLogCollection('level', 'INFO');
      await next();
      ctx.setLogCollection('status', ctx.res.statusCode);
      ctx.setLogCollection('fetchEnd', Date.now());
      ctx.logger.info(ctx.getLogs());
    }
  };
}
