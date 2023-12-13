import { Context } from '@midwayjs/web';

export default () => {
  return async (ctx: Context, next: () => Promise<any>) => {
    const start = Date.now();
    console.debug('---receive packet: ', JSON.stringify(ctx.packet));
    await next();
    console.debug('---packet handle duration: ', Date.now() - start);
  };
};
