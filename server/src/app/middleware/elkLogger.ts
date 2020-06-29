import { Context, EggAppConfig } from 'egg';

/**
 * elk
 * @description request intercept,log report,prod default open
 * @param {EggAppConfig["elkLogger"]} options config elkLogger
 * @returns {any}
 */
export default function elkLogger(options: EggAppConfig['elkLogger']): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    const { match, enable } = options;
    // match
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
