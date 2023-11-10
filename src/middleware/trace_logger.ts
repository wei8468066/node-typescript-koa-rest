import { Context, Middleware } from 'koa';
import logger from '../lib/logger';

export default (): Middleware => {
  return async (ctx: Context, next: () => Promise<any>): Promise<void> => {
    const start = new Date().getTime();
    logger.info(`[${ctx.ip}] ${ctx.method} ${ctx.originalUrl} ${JSON.stringify(ctx.query)}`);
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    }
    const ms = new Date().getTime() - start;
    const msg = `[${ctx.ip}] ${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms`;
    if (ctx.status >= 500) {
      logger.error(msg);
    } else if (ctx.status >= 400) {
      logger.warn(msg);
    } else {
      logger.info(msg);
    }
  };

};
