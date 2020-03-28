import { EggAppConfig, PowerPartial } from 'egg';
import {Context} from "midway";

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  // 业务接口domain
  config.apiDomain = {
    loan: '',
  };
  // CORS 跨域处理
  config.cors = {
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true,
    origin(ctx: Context) {
      const origin: string = ctx.get('origin');
      // 允许*域名访问
      if (origin.indexOf('*') > -1) {
        return origin;
      } else {
        return '*';
      }
    },
  };
  return config;
};
