import type { FastifyInstance } from 'fastify';

import { appLogger } from '#app/logger';
import { createServer } from '#app/app';

const port = Number(process.env.LISTEN_PORT) || 3000;
const start = async (server: FastifyInstance): Promise<void> => {
  try {
    await server.listen(port, '0.0.0.0');
    appLogger.info(`Server is listening on port:${port}`);
  } catch (err) {
    console.log(err);
    server.log.error(err);
    process.exit(1);
  }
};
process.on('uncaughtException', (error) => {
  console.error(error);
});
process.on('unhandledRejection', (error) => {
  console.error(error);
});
createServer().then((s) => {
  start(s);
});
