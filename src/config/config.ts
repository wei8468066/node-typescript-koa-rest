import fs from 'fs';
import path from 'path';
import { DataSourceOptions } from 'typeorm';
import jwt from 'koa-jwt';
import winston, { LoggerOptions, format } from 'winston';

// 默认开发环境

let envConfig;
// 定义要检查的文件路径
const envConfigExtName = path.extname(__filename);
const envConfigPath = path.join(__dirname, `config.${process.env.NODE_ENV}${envConfigExtName}`);
if (fs.existsSync(envConfigPath)) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  envConfig = require(envConfigPath).default;
}

const appName = 'demo-pro';

// 配置项
const config = {
  // 启动端口
  port: 3000,

  isProd: false,

  // 调试日志
  debugLogging: true,

  logger: {
    format: format.combine(
      format.timestamp(),
      // format.printf((option) => {
      //   return `${option.timestamp} [${option.level.toUpperCase()}] ${option.message}, ${option.meta}`;
      // }),
      format.json(),
    ),
    defaultMeta: { service: appName },
    transports: [
      new winston.transports.Console({ debugStdout: true }),
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
  } as LoggerOptions,

  jwt: {
    // jwt密钥
    secret: 'your-secret-whatever',
    passthrough: true,
  } as jwt.Options,

  // 数据库配置
  mongodb: {
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    database: 'koa-demo',
    logging: false,
  } as DataSourceOptions,

  // 定时任务配置
  cronJobExpression: '0 * * * *',
};

// 合并环境配置
if (envConfig) {
  Object.assign(config, envConfig);
}
export default config;