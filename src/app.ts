import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyCORS from 'fastify-cors';
import GQL from 'fastify-gql';
import fastifyMultipart from 'fastify-multipart';
import openapiGlue from 'fastify-openapi-glue';
import swagger from 'fastify-swagger';
import yaml from 'js-yaml';
import { v2 } from 'api/controllers';
import { join } from 'path';
import { instance } from 'db/instance';
import { apiLogger } from 'logger';
import { schema, resolvers } from 'api/graphql';
import { readFileSync } from 'fs';
import { initImgProcessor } from 'internal/utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { plugin, getSummary } = require('@promster/fastify');

export async function createServer(): Promise<FastifyInstance> {
  initImgProcessor();

  await instance.init();

  const server = fastify({
    logger: apiLogger
  });

  server.register(fastifyCORS, { origin: true });

  server.register(GQL, { schema, resolvers, path: '/api/graphql' });

  server.addHook('onSend', (_, rep, payload, done) => {
    rep.header('zekth-looking-for', 'bombkings did you see them?');
    rep.header('seriously', "You're looking at http headers? COME ON");
    done(null, payload);
  });

  await instance.init();

  server.register(fastifyMultipart, { addToBody: true, limits: { files: 1, fieldSize: 5e6 } });

  // Redirecting on / for legacy app
  server.route({
    method: 'GET',
    url: '/',
    handler: (_: FastifyRequest, rep: FastifyReply) => {
      rep.redirect('https://keycap-archivist.com/');
    }
  });

  server.route({
    method: 'GET',
    url: '/health',
    handler: (_: FastifyRequest, rep: FastifyReply) => {
      rep.status(200).send('OK');
    }
  });

  const SPECS_PATH = join(__dirname, 'assets', 'v2-spec.yaml');
  const specs = yaml.safeLoad(readFileSync(SPECS_PATH));
  server.register(openapiGlue, {
    specification: specs,
    prefix: 'api/v2',
    service: v2,
    noAdditional: true
  });

  server.register(swagger, {
    mode: 'static',
    exposeRoute: true,
    routePrefix: '/api/v2/documentation',
    specification: {
      path: SPECS_PATH,
      postProcessor: function (swaggerObject) {
        return swaggerObject;
      },
      baseDir: __dirname
    }
  });

  server.register(plugin, {
    skip: (req: FastifyRequest) => req.method === 'OPTIONS'
  });

  server.route({
    method: 'GET',
    url: '/metrics',
    handler: (_: FastifyRequest, rep: FastifyReply) => {
      rep.status(200).send(getSummary());
    }
  });

  return server;
}
