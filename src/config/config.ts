import * as _ from 'lodash';
import fs from 'fs';
import path from 'path';

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
    databaseUrl: 'postgres://user:pass@localhost:5432/apidb',
    dbEntitiesPath: [ './entity/**/*.ts' ],
  },

  // 定时任务配置
  cronJobExpression: '0 * * * *',
};

// 合并环境配置
if (envConfig) {
  Object.assign(config, envConfig);
}
export default config;