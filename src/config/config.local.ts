import defaultConfig from './config';

const config: Partial<typeof defaultConfig> = {
  port: 8080,
  mongodb: {
    type: 'mongodb',
    host: 'localhost',
    port: 27017,
    database: 'koa-demo',
    logging: true,
  },
};

export default config;