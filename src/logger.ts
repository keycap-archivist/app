import pino from 'pino';

export const apiLogger: pino = pino({
  prettyPrint: { colorize: false },
  level: 'warn'
}).child({
  name: 'API_LOGGER'
});

export const appLogger: pino = pino({
  prettyPrint: { colorize: false }
}).child({
  name: 'APP_LOGGER'
});
