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
      console.log(origin, 'orgin');
      // 允许*域名访问
      if (origin.indexOf('http://172.22.72.70:8080') > -1) {
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

  // 业务接口domain
  config.apiDomain = {
    loanDomain: '*',
  };

  // jsonwebtoken 插件配置
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
        connectionMiddleware: [ 'auth' ],
        packetMiddleware: [],
      },
    },
    redis: {
      host: '127.0.0.1',
      port: 6379,
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
    // 单数据库信息配置
    client: {
      // host
      host: '127.0.0.1',
      // 端口号
      port: '3306',
      // 用户名
      user: 'root',
      // 密码
      password: '123456',
      // 数据库名
      database: 'poker',
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };

  return {
    ...bizConfig,
    ...config,
  };
};
