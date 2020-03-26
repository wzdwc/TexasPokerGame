import { Context } from 'egg';

/**
 * 404状态处理
 * @returns {any}
 */
export default function notFound(): any {
  return async (ctx: Context, next: () => Promise<any>) => {
    await next();
    if (ctx.status === 404 && !ctx.body) {
      if (ctx.acceptJSON) {
        ctx.body = {
          code: '404',
          data: {},
          msg: '页面坐火箭去了',
        };
      } else {
        ctx.body = '<h1>Page Not Found</h1>';
      }
    }
  };
}
