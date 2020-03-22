import * as fastify from 'fastify';
import * as pino from 'pino';
import * as openApiGlue from 'fastify-openapi-glue';
import * as fastifyStatic from 'fastify-static';
import * as fastifyCORS from 'fastify-cors';
import { controllers } from 'api/controllers';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { initDb } from 'db/instance';
import { apiLogger } from 'logger';

export async function createServer() {
  const server = fastify({
    logger: apiLogger
  });
  server.register(fastifyStatic, {
    root: join(__dirname, 'public')
  });
  server.register(fastifyCORS, { origin: true });
  const specs = yaml.safeLoad(
    fs.readFileSync(join(__dirname, 'api', 'specs.yaml'), 'utf8')
  );

  const openApiOptions = {
    specification: specs,
    service: controllers,
    prefix: 'api/v1'
  };
  server.register(openApiGlue, openApiOptions);

  await initDb();

  return server;
}
