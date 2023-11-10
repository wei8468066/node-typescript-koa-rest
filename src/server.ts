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
import { cron } from './cron_job';
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
      console.log(`Server running on port ${config.port}`);
    });
  
  })
  .catch(error => {
    // 启动报错
    console.log('init error! will quit!', error);
    closeApp()
      .catch((error) => {
        console.log('app close error:', error);
      })
      .finally(() => {
        process.exit(1);
      });
  });

async function closeApp() {
  await server.close();
  await mongo.destroy();
}