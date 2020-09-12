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
  config.mysql = {
    client: {
      // host
      host: '47.104.172.100',
      // pot
      port: '3306',
      // userName
      user: 'root',
      // password
      password: 'gameTest2020.',
      // database name
      database: 'poker',
    },
    app: true,
    agent: false,
  };
  return config;
};
