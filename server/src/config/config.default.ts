import { Context } from "@midwayjs/web";
import { EggAppConfig, PowerPartial } from "egg";
import { MidwayConfig, MidwayAppInfo } from "@midwayjs/core";

export default (appInfo: MidwayAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  config.egg = { port: process.env.PORT || 7001 };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + "_20231118221445";
  config.middleware = ["notFound"];

  const bizConfig = {
    sourceUrl: "",
  };

  // security
  config.security = {
    csrf: { enable: false },
    methodnoallow: { enable: false },
  };

  // CORS
  config.cors = {
    allowMethods: "GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS",
    credentials: true,
    origin(ctx: Context) {
      const origin: string = ctx.get("origin");
      // access origin
      if (origin.indexOf("") > -1) {
        // console.log('come in');
        return origin;
      } else {
        return "*";
      }
    },
  };

  // logger
  config.logger = {
    outputJSON: false,
    appLogName: "app.log",
    coreLogName: "core.log",
    agentLogName: "agent.log",
    errorLogName: "error.log",
  };

  // business domain
  config.apiDomain = {};

  // jsonwebtoken
  config.jwt = {
    secret: "123456",
    enable: true,
    match(ctx: Context) {
      const reg = /login|register/;
      return !reg.test(ctx.originalUrl);
    },
  };

  // socket io setting
  config.io = {
    namespace: {
      "/socket": {
        connectionMiddleware: ["auth", "join"],
        packetMiddleware: ["log"],
      },
    },
    redis: {
      host: "127.0.0.1",
      port: 6379,
      password: "123456",
    },
  };

  config.redis = {
    client: {
      port: 6379,
      host: "127.0.0.1",
      password: "123456",
      db: 0,
    },
  };

  config.mysql = {
    client: {
      // host
      host: "127.0.0.1",
      // pot
      port: "3306",
      // userName
      user: "root",
      // password
      password: "123456",
      // database name
      database: "poker",
    },
    app: true,
    agent: false,
  };

  return {
    ...bizConfig,
    ...config,
  } as MidwayConfig;
};
