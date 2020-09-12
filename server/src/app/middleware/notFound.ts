import { Context } from 'egg';

/**
 * 404
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
          msg: 'page not found',
        };
      } else {
        ctx.body = '<h1>Page Not Found</h1>';
      }
    }
  };
}
