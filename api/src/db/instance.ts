import { Sequelize } from 'sequelize';
import { apiLogger, appLogger, dbLogger } from 'logger';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  // storage: ':memory:'
  storage: 'database.sqlite',
  logging: sql => dbLogger.info(sql)
});
