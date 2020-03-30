import { gql } from 'apollo-server-fastify';
import { readFileSync } from 'fs';
import { join } from 'path';
import { instance } from 'db/instance';
import { appLogger } from 'logger';
import { Artist, Sculpt, Colorway } from 'db/instance';

const gqlStr = readFileSync(join(__dirname, 'schema.gql'), 'utf-8');
export const typeDefs = gql`
  ${gqlStr}
`;

export const resolvers = {
  Query: {
    dbVersion: (): String => {
      return instance.db.version;
    },
    allArtists: (): Artist[] => {
      return instance.db.data;
    },
    allSculpts: (obj, args, context, info): Sculpt[] => {
      return instance.getSculpts(args.artistId);
    },
    allColorways: (obj, args, context, info): Colorway[] => {
      return instance.getColorways(args.sculptId);
    },
    artist: (obj, args, context, info): Artist => {
      return instance.getArtist(args.id);
    },
    sculpt: (obj, args, context, info): Sculpt => {
      return instance.getSculpt(args.id);
    },
    colorway: (obj, args, context, info): Colorway => {
      return instance.getColorway(args.id);
    }
  }
};
