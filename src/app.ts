import fastify from 'fastify';
import fastifyCORS from 'fastify-cors';
import GQL from 'fastify-gql';
import fastifyMultipart from 'fastify-multipart';
import openapiGlue from 'fastify-openapi-glue';
import swagger from 'fastify-swagger';
import yaml from 'js-yaml';
import { join } from 'path';
import { readFileSync } from 'fs';
import { plugin, getSummary } from '@promster/fastify';

import { apiLogger } from '#app/logger';
import { v2 } from '#app/api/controllers/index';
import { instance } from '#app/db/instance';
import { schema, resolvers } from '#app/api/graphql/index';
import { initImgProcessor } from '#app/internal/utils';

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function createServer(): Promise<FastifyInstance> {
  const p = [];
  initImgProcessor();

  p.push(instance.init());

  const server = fastify({
    logger: apiLogger
  });

  server.register(fastifyCORS, { origin: true, methods: 'GET,POST' });

  server.register(GQL, { schema, resolvers, path: '/api/graphql' });

  server.addHook('onSend', (_, rep, payload, done) => {
    rep.header('zekth-looking-for', 'bombkings did you see them?');
    rep.header('seriously', "You're looking at http headers? COME ON");
    done(null, payload);
  });

  server.register(fastifyMultipart, { addToBody: true, limits: { files: 1, fieldSize: 5e6 } });

  server.route({
    method: 'GET',
    url: '/health',
    handler: (_: FastifyRequest, rep: FastifyReply) => {
      rep.status(200).send('OK');
    }
  });

  const SPECS_PATH = join(__dirname, 'assets', 'v2-spec.yaml');
  const specs = yaml.load(readFileSync(SPECS_PATH));
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
    // @ts-ignore
    skip: (req: FastifyRequest) => {
      apiLogger.info(req);
      return req.raw.method === 'OPTIONS';
    }
  });

  server.route({
    method: 'GET',
    url: '/metrics',
    handler: async (_: FastifyRequest, rep: FastifyReply) => {
      const metrics = await getSummary();
      rep.status(200).send(metrics);
    }
  });

  await Promise.all(p);

  return server;
}
