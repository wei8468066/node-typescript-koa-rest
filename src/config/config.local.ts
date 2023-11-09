import defaultConfig from './config';

const config: Partial<typeof defaultConfig> = {
  port: 8080,
  mongodb: {
    databaseUrl: 'mongodb://localhost:27017',
    dbEntitiesPath: [ './entity/**/*.ts' ],
  },
};

export default config;