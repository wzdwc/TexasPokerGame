import { EggAppConfig, PowerPartial } from 'egg';
import { Context } from 'midway';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  // business domain
  config.apiDomain = {
  };
  // CORS
  config.cors = {
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true,
    origin(ctx: Context) {
      const origin: string = ctx.get('origin');
      console.log(origin, 'orgin');
      // 允许*域名访问
      if (origin.indexOf('http://www.jojgame.com') > -1) {
        console.log('come in');
        return origin;
      } else {
        return '*';
      }
    },
  };
  return config;
};
