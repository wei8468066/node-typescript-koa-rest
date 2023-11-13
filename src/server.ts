import Koa from 'koa';
import jwt from 'koa-jwt';
import bodyParser from 'koa-bodyparser';
import helmet from 'koa-helmet';
import cors from '@koa/cors';
import 'reflect-metadata';

import traceLogger from './middleware/trace_logger';
import config from './config/config';
import { unprotectedRouter } from './unprotectedRoutes';
import { protectedRouter } from './protectedRoutes';
import { cron } from './schedule/cron_job';
import mongo from './datasource';
import { Server } from 'http';

// 一些组件的初始化
async function componentsInit() {
  await mongo.initialize();
  
}

let server: Server;
componentsInit()
  .then(() => {
    const app = new Koa();
    // Provides important security headers to make your app more secure
    app.use(helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: [ `'self'` ],
        scriptSrc: [ `'self'`, `'unsafe-inline'`, 'cdnjs.cloudflare.com' ],
        styleSrc: [ `'self'`, `'unsafe-inline'`, 'cdnjs.cloudflare.com', 'fonts.googleapis.com' ],
        fontSrc: [ `'self'`, 'fonts.gstatic.com' ],
        imgSrc: [ `'self'`, 'data:', 'online.swagger.io', 'validator.swagger.io' ],
      },
    }));

    // Enable cors with default options
    app.use(cors());

    // Logger middleware -> use winston as logger (logging.ts with config)
    app.use(traceLogger());

    // Enable bodyParser with default options
    app.use(bodyParser());

    // these routes are NOT protected by the JWT middleware, also include middleware to respond with "Method Not Allowed - 405".
    app.use(unprotectedRouter.routes()).use(unprotectedRouter.allowedMethods());

    // jwt中间件拦截，注意不要拦截swagger
    app.use(jwt(config.jwt).unless({ path: [ /^\/swagger-/ ] }));

    // These routes are protected by the JWT middleware, also include middleware to respond with "Method Not Allowed - 405".
    app.use(protectedRouter.routes()).use(protectedRouter.allowedMethods());

    // Register cron job to do any action needed
    cron.start();

    server = app.listen(config.port, () => {
      console.log(`process id:`, process.pid);
      console.log(`Server running on port ${config.port}`);
    });
    // 注册优雅关闭
    server.on('close', () => {
      console.log(`server recived signal: close`);
      // 执行一些例如断开数据库的操作
    });
    // 停机信号
    const downSignal: Array<'SIGTERM' | 'SIGINT'> = [ 'SIGTERM', 'SIGINT' ];
    downSignal.forEach(signal => {
      process.on(signal, () => {
        console.log(`process ${process.pid} recived signal:`, signal);
        server.close((error) => {
          if (error) {
            console.log('server closed error!', error);
            process.exit(1);
          }
          console.log('server closed successful!');
          process.exit(0);
        });
      });
    });
  })
  .catch(error => {
    // 启动报错
    console.log('init error! will quit!', error);
    process.exit(1);
  });
