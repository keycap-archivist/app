import * as fastify from 'fastify';
import * as URL from 'url';
import * as fastifyStatic from 'fastify-static';
import * as fastifyCORS from 'fastify-cors';
import { controllers } from 'api/controllers';
import { join } from 'path';
import { instance } from 'db/instance';
import { apiLogger } from 'logger';
import { ApolloServer } from 'apollo-server-fastify';
import { typeDefs, resolvers } from 'api/graphql';
import {
  GraphiQLData,
  resolveGraphiQLString
} from 'apollo-server-module-graphiql';

export async function createServer() {
  const server = fastify({
    logger: apiLogger
  });

  server.register(fastifyStatic, {
    root: join(__dirname, 'public')
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
