import pino from 'pino';

const apiLogger: pino = pino({
  prettyPrint: { colorize: false },
  level: 'warn'
}).child({
  name: 'API_LOGGER'
});
const appLogger: pino = pino({
  prettyPrint: { colorize: false }
}).child({
  name: 'APP_LOGGER'
});

export { apiLogger, appLogger };
