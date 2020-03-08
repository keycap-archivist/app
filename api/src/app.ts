import * as fastify from 'fastify';
import * as pino from 'pino';
import * as openApiGlue from 'fastify-openapi-glue';
import * as fastifyStatic from 'fastify-static';
import * as fastifyCORS from 'fastify-cors';
import { controllers } from 'api/controllers';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { Sequelize } from 'sequelize';
import * as User from 'db/models/users';

async function dbInit() {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:'
  });
  User.init(sequelize);
  await sequelize.sync();
  await sequelize.authenticate();
}

export async function createServer() {
  const logger = pino({
    prettyPrint: { colorize: true }
  });
  const server = fastify({
    logger
  });
  server.register(fastifyStatic, {
    root: join(__dirname, 'public')
  });
  server.register(fastifyCORS, { origin: true });
  const specs = yaml.safeLoad(
    fs.readFileSync(join(__dirname, 'api', 'specs.yaml'), 'utf8')
  );
  const openApioptions = {
    specification: specs,
    service: controllers,
    prefix: 'api/v1'
  };
  server.register(openApiGlue, openApioptions);
  await dbInit();
  await User.User.create({ username: 'bob' });
  const r = await User.User.findAll();
  server.log.info(r);
  return server;
}
