import { Application } from "egg";

export default (app: Application) => {
  app.beforeStart(async () => {});
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err: any) {
      if (err.name === "UnauthorizedError") {
        ctx.status = 401;
        ctx.body = {
          data: {},
          message: "invalid token...",
        };
        ctx.logger.error("invalid token...", err);
      }
    }
  });
};
