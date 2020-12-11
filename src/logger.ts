import pino from 'pino';
const mainLogger = pino({
  prettyPrint: { colorize: false }
});

const _apiLogger = mainLogger.child({
  name: 'API_LOGGER'
});
_apiLogger.level = 'warn';

export const apiLogger = _apiLogger;

export const appLogger: pino.BaseLogger = mainLogger.child({
  name: 'APP_LOGGER'
});
