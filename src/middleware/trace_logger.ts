import { Context, Middleware } from 'koa';
import logger from '../lib/logger';
import { v4 } from 'uuid';

export default (): Middleware => {
  return async (ctx: Context, next: () => Promise<any>): Promise<void> => {
    const start = new Date().getTime();
    ctx.traceId = v4();
    logger.info('trace_log_request', { 
      traceId: ctx.traceId,
      ip: ctx.ip,
      method: ctx.method, 
      url: ctx.originalUrl,
      query: ctx.query,
      body: ctx.request.body,
    });
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.message;
    }
    const ms = new Date().getTime() - start;
    logger.info('trace_log_response', {
      traceId: ctx.traceId,
      ip: ctx.ip,
      method: ctx.method,
      url: ctx.originalUrl,
      query: ctx.query,
      body: ctx.request.body,
      ms,
    });
  };

};
