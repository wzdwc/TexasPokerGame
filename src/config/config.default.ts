import { EggAppConfig, EggAppInfo, PowerPartial, Context } from 'midway';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_{{keys}}';

  // elk日志中间件，404处理中间件
  config.middleware = [ 'elkLogger', 'notFound' ];

  // 合成配置
  const bizConfig = {
    sourceUrl: '',
    elkLogger: {
      // 请求url匹配规则
      match(ctx: Context) {
        const reg = /.*/;
        return reg.test(ctx.url);
      },
      // 是否启用
      enable: true,
    },
  };
  // 安全处理
  config.security = {
    csrf: {
      enable: false,
    },
    methodnoallow: {
      enable: false,
    },
  };
  // CORS 跨域处理
  config.cors = {
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true,
    origin(ctx: Context) {
      const origin: string = ctx.get('origin');
      // 允许*域名访问
      if (origin.indexOf('127.0.0.1') > -1) {
        console.log('come in');
        return origin;
      } else {
        return '*';
      }
    },
  };

  // 日志配置
  config.logger = {
    outputJSON: false,
    appLogName: 'app.log',
    coreLogName: 'core.log',
    agentLogName: 'agent.log',
    errorLogName: 'error.log',
  };

  // redis
  config.redis = {
    client: {
      port: 6379,          // Redis port
      host: '127.0.0.1',   // Redis host
      password: '123456',
      db: 0,
    },
  };

  return {
    ...bizConfig,
    ...config,
  };
};
