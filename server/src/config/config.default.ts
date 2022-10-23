import { EggAppConfig, EggAppInfo, PowerPartial, Context } from 'midway';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_{{keys}}';

  // elk log，404
  config.middleware = [ 'elkLogger', 'notFound' ];

  const bizConfig = {
    sourceUrl: '',
    elkLogger: {
      // request url match
      match(ctx: Context) {
        const reg = /.*/;
        return reg.test(ctx.url);
      },
      enable: true,
    },
  };
  // security
  config.security = {
    csrf: {
      enable: false,
    },
    methodnoallow: {
      enable: false,
    },
  };
  // CORS
  config.cors = {
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true,
    origin(ctx: Context) {
      const origin: string = ctx.get('origin');
      // console.log(origin, 'orgin');
      // access origin
      if (origin.indexOf('') > -1) {
        // console.log('come in');
        return origin;
      } else {
        return '*';
      }
    },
  };

  // logger
  config.logger = {
    outputJSON: false,
    appLogName: 'app.log',
    coreLogName: 'core.log',
    agentLogName: 'agent.log',
    errorLogName: 'error.log',
  };

  // business domain
  config.apiDomain = {};

  // jsonwebtoken
  config.jwt = {
    secret: '123456',
    enable: true,
    match(ctx: Context) {
      const reg = /login|register/;
      return !reg.test(ctx.originalUrl);
    },
  };

  // socket io setting
  config.io = {
    namespace: {
      '/socket': {
        connectionMiddleware: [ 'auth', 'join', 'leave' ],
        packetMiddleware: [],
      },
    },
    redis: {
      host: '127.0.0.1',
      port: 6379,
      password: '123456',
    },
  };

  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '123456',
      db: 0,
    },
  };
  config.mysql = {
    client: {
      // host
      host: '127.0.0.1',
      // pot
      port: '3306',
      // userName
      user: 'root',
      // password
      password: '',
      // database name
      database: 'poker',
    },
    app: true,
    agent: false,
  };

  return {
    ...bizConfig,
    ...config,
  };
};
