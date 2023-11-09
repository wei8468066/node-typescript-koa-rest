import * as _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { DataSourceOptions } from 'typeorm';

// 默认开发环境
process.env.NODE_ENV = process.env.NODE_ENV || 'local';

let envConfig;
// 定义要检查的文件路径
const envConfigExtName = path.extname(__filename);
const envConfigPath = path.join(__dirname, `config.${process.env.NODE_ENV}${envConfigExtName}`);
if (fs.existsSync(envConfigPath)) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  envConfig = require(envConfigPath).default;
}

// 配置项
const config = {
  // 启动端口
  port: 3000,

  // 调试日志
  debugLogging: true,

  // jwt密钥
  jwtSecret: 'your-secret-whatever',

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