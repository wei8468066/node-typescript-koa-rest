import defaultConfig from './config';

const config: Partial<typeof defaultConfig> = {
  port: 8080,
  isProd: true,
  mongodb: {
    type: 'mongodb',
    host: '192.168.1.170',
    port: 27017,
    database: 'koa-demo',
    logging: true,
  },
};

export default config;