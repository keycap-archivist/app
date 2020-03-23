import * as fastify from 'fastify';
import * as URL from 'url';
import * as fastifyStatic from 'fastify-static';
import * as fastifyCORS from 'fastify-cors';
import { controllers } from 'api/controllers';
import { join } from 'path';
import { instance } from 'db/instance';
import { apiLogger, appLogger } from 'logger';
import { ApolloServer } from 'apollo-server-fastify';
import { typeDefs, resolvers } from 'api/graphql';
import { GraphiQLData, resolveGraphiQLString } from 'apollo-server-module-graphiql';
import * as marked from 'marked';
import { readFileSync } from 'fs';

export async function createServer() {
  const server = fastify({
    logger: apiLogger
  });

  server.register(fastifyCORS, { origin: true });

  await instance.init();

  const graphQlServer = new ApolloServer({
    typeDefs,
    resolvers
  });

  const graphiqlHandler = async (request, reply) => {
    try {
      const query = request.req.url && URL.parse(request.req.url, true).query;
      const graphiqlString = await resolveGraphiQLString(
        query,
        {
          endpointURL: '/graphql'
        },
        [request, reply]
      );
      reply.type('text/html').send(graphiqlString);
    } catch (error) {
      reply.code(500);
      reply.send(error.message);
    }
  };
  server.register(graphQlServer.createHandler({ path: '/graphql' }));
  const gqlStr = readFileSync(join(__dirname, 'api', 'graphql', 'schema.gql'), 'utf-8');
  const indexFile = readFileSync(join(__dirname, 'public', 'index.md'), 'utf-8').replace('{gql-content}', gqlStr);
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
    url: '/',
    handler: (_, resp) => {
      resp.type('text/html').send(compiledIndex);
    }
  });
  server.route({
    method: 'GET',
    url: '/graphiql',
    handler: graphiqlHandler
  });
  server.route({
    method: 'GET',
    url: '/api/v1',
    handler: controllers.genWishlist
  });

  return server;
}
