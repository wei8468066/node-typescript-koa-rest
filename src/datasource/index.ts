import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../entity/user';
import config from '../config/config';

// to initialize initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
class defaultModel extends DataSource {
  constructor(options: DataSourceOptions) {
    super(options);
  }

  // 这里可以加入自己需要的一些方法，例如快速查询
}

const mongo = new defaultModel({
  ...config.mongodb,
  entities: [ User ],
});

export default mongo;