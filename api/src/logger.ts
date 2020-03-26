import * as pino from 'pino';
const mainLogger: pino = pino({
  prettyPrint: { colorize: false }
});
const apiLogger: pino = mainLogger.child({
  name: 'API_LOGGER'
});
const appLogger: pino = mainLogger.child({
  name: 'APP_LOGGER'
});
const dbLogger: pino = mainLogger.child({
  name: 'DB_LOGGER'
});
export { apiLogger, appLogger, dbLogger };
