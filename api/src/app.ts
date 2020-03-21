import * as fastify from 'fastify';
import * as fastifyStatic from 'fastify-static';
import * as fastifyCORS from 'fastify-cors';
import { controllers } from 'api/controllers';
import { join } from 'path';
import { initDb } from 'db/instance';
import { apiLogger } from 'logger';
import { ApolloServer } from 'apollo-server-fastify';
import { typeDefs, resolvers } from 'api/graphql';

export async function createServer() {
  const server = fastify({
    logger: apiLogger
  });


  server.register(fastifyStatic, {
    root: join(__dirname, 'public')
  });

  server.register(fastifyCORS, { origin: true });

  await initDb();
  const graphQlServer = new ApolloServer({
    typeDefs,
    resolvers
  });
  server.register(graphQlServer.createHandler({ path: '/graphql' }));

  server.route({
    method: 'GET',
    url: '/api/v1',
    handler: controllers.genWishlist
  });
  return server;
}
