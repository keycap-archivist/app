import pino from 'pino';

export const apiLogger: pino.BaseLogger = pino({
  prettyPrint: { colorize: false },
  level: 'warn'
}).child({
  name: 'API_LOGGER'
});

export const appLogger: pino.BaseLogger = pino({
  prettyPrint: { colorize: false }
}).child({
  name: 'APP_LOGGER'
});
