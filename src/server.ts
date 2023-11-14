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
import mongo from './datasource';
import { Server } from 'http';
import start from './schedule';

let server: Server;

// 一些组件的初始化
async function initComponents() {
  await mongo.initialize();
}

// app初始化
async function initApp() {
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

  app.use(cors());

  app.use(traceLogger());

  app.use(bodyParser());

  app.use(unprotectedRouter.routes()).use(unprotectedRouter.allowedMethods());

  app.use(jwt(config.jwt).unless({ path: [ /^\/swagger-/ ] }));

  app.use(protectedRouter.routes()).use(protectedRouter.allowedMethods());

  server = app.listen(config.port, () => {
    console.log(`process id:`, process.pid);
    console.log(`NODE_ENV:`, process.env.NODE_ENV);
    console.log(`Server running on port ${config.port}`);
  });
}

async function startCron() {
  if (config.isProd) {
    start();
  }
}

// 注册优雅停机
async function initGracefulShutdown() {
  if (config.isProd) {
    const downSignal: Array<'SIGTERM' | 'SIGINT'> = [ 'SIGTERM', 'SIGINT' ];
    downSignal.forEach(signal => {
      process.on(signal, () => {
        console.log(`process ${process.pid} recived signal:`, signal);
        server.close((error) => {
          if (error) {
            console.log('server closed error:', error);
          } else {
            console.log('server closed successful.');
          }
          __shutdownWork()
            .then(() => {
              console.log('components disconnected.');
              process.exit(0);
            })
            .catch((error) => {
              console.log('components disconnect error:', error);
              process.exit(1);
            });
        });
      });
    });
  }
}

// 停机前的清理工作，如kafka消费暂停，数据库断开等
async function __shutdownWork() {
  await mongo.destroy();
}

initComponents()
  .then(initApp)
  .then(startCron)
  .then(initGracefulShutdown)
  .catch(error => {
    // 启动报错
    console.log('app init error:', error);
    process.exit(1);
  });
