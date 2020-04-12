import * as fastify from 'fastify';
import * as fastifyStatic from 'fastify-static';
import * as fastifyCORS from 'fastify-cors';
import { controllers } from 'api/controllers';
import { join } from 'path';
import { instance } from 'db/instance';
import { apiLogger, appLogger } from 'logger';
import { ApolloServer } from 'apollo-server-fastify';
import { typeDefs, resolvers } from 'api/graphql';
import * as marked from 'marked';
import { readFileSync } from 'fs';

export async function createServer(): Promise<any> {
  const server = fastify({
    logger: apiLogger
  });

  server.register(fastifyCORS, { origin: true });
  server.register(fastifyStatic, {
    root: join(__dirname, 'public'),
    setHeaders: (res, path, _) => {
      // ignore cache for index
      if (path.indexOf('index.html') !== -1) {
        res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.setHeader('Expires', '-1');
        res.setHeader('Pragma', 'no-cache');
      }
    }
  });
  await instance.init();

  const graphQlServer = new ApolloServer({
    typeDefs,
    resolvers
  });

  server.register(graphQlServer.createHandler({ path: '/api/graphql' }));
  const gqlStr = readFileSync(join(__dirname, 'api', 'graphql', 'schema.gql'), 'utf-8');
  const indexFile = readFileSync(join(__dirname, 'internal', 'doc', 'index.md'), 'utf-8').replace(
    '{gql-content}',
    gqlStr
  );
  const compiledIndex = `<html><head><title>Too much Artisans API</title>
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

  server.route({
    method: 'GET',
    url: '/api/v1/table',
    handler: controllers.genTable
  });

  server.route({
    method: 'GET',
    url: '/api/v1',
    handler: controllers.genWishlist
  });

  server.route({
    method: 'GET',
    url: '/api/v1/img/:id',
    handler: controllers.getKeycapImage
  });

  return server;
}
