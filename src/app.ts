import fastify from 'fastify';
import fastifyCORS from 'fastify-cors';
import fastifyMultipart from 'fastify-multipart';
import openapiGlue from 'fastify-openapi-glue';
import yaml from 'js-yaml';
import { v1, v2 } from 'api/controllers';
import { join } from 'path';
import { instance } from 'db/instance';
import { apiLogger } from 'logger';
import { ApolloServer } from 'apollo-server-fastify';
import { typeDefs, resolvers } from 'api/graphql';
import marked from 'marked';
import { readFileSync } from 'fs';
import { initImgProcessor } from 'internal/utils';

export async function createServer(): Promise<any> {
  initImgProcessor();

  await instance.init();

  const server = fastify({
    logger: apiLogger
  });
  server.register(fastifyCORS, { origin: true });
  await instance.init();

  const graphQlServer = new ApolloServer({
    typeDefs,
    resolvers
  });

  server.register(graphQlServer.createHandler({ path: '/api/graphql' }));
  server.register(fastifyMultipart);
  const gqlStr = readFileSync(join(__dirname, 'api', 'graphql', 'schema.gql'), 'utf-8');
  const indexFile = readFileSync(join(__dirname, 'internal', 'doc', 'index.md'), 'utf-8').replace(
    '{gql-content}',
    gqlStr
  );
  const compiledIndex = `<html><head><title>Keycap Archivist API</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
.markdown-body {
box-sizing: border-box;
min-width: 200px;
max-width: 980px;
margin: 0 auto;
padding: 45px;
}

@media (max-width: 767px) {
.markdown-body {
padding: 15px;
}
}
</style>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css"></head><body class="markdown-body">${marked(
    indexFile
  )}</body></html>`;
  server.route({
    method: 'GET',
    url: '/api',
    handler: (_, resp) => {
      resp.type('text/html').send(compiledIndex.replace('{SHA_API_VERSION}', instance.getDbVersion()));
    }
  });

  // Redirecting on / for legacy app
  server.route({
    method: 'GET',
    url: '/',
    handler: (_, rep) => {
      rep.redirect('https://keycap-archivist.com/');
    }
  });

  server.route({
    method: 'GET',
    url: '/api/v1/table',
    handler: v1.genTable
  });

  server.route({
    method: 'GET',
    url: '/api/v1',
    handler: v1.genWishlistGet
  });

  server.route({
    method: 'POST',
    url: '/api/v1',
    schema: {
      body: {
        required: ['ids'],
        ids: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        priorities: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        bg: { type: 'string' },
        titleText: { type: 'string' },
        titleColor: { type: 'string' },
        textColor: { type: 'string' },
        extraTextColor: { type: 'string' },
        capsPerLine: { type: 'integer' },
        extraText: { type: 'string' }
      }
    },
    handler: v1.genWishlistPost
  });

  server.route({
    method: 'GET',
    url: '/api/v1/img/:id',
    handler: v1.getKeycapImage
  });

  const specs = yaml.safeLoad(readFileSync(join(__dirname, 'public', 'v2-spec.yml')));
  server.register(openapiGlue, {
    specification: specs,
    prefix: 'api/v2',
    service: v2,
    noAdditional: true
  });

  return server;
}
