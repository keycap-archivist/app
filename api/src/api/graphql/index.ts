import { gql, concatenateTypeDefs } from 'apollo-server-fastify';
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
    allArtists: (): Artist[] => {
      return instance.db;
    },
    allSculpts: (obj, args, context, info): Sculpt[] => {
      const sculpts = instance.db.find(x => x.id === args.artistId);
      if (!sculpts) {
        return [];
      }
      return sculpts.sculpts;
    },
    allColorways: (obj, args, context, info): Colorway[] => {
      let match: Sculpt;
      for (const a of instance.db) {
        match = a.sculpts.find(x => {
          return x && x.id === args.sculptId;
        });
        if (match) {
          return match.colorways;
        }
      }
      return [];
    },
    artist: (obj, args, context, info): Artist => {
      return instance.db.find(x => x.id === args.id);
    },
    sculpt: (obj, args, context, info): Sculpt => {
      let match: Sculpt;
      for (const a of instance.db) {
        match = a.sculpts.find(x => {
          return x && x.id === args.id;
        });
        if (match) {
          return match;
        }
      }
      return match;
    },
    colorway: (obj, args, context, info): Colorway => {
      let match: Colorway;
      for (const a of instance.db) {
        for (const s of a.sculpts) {
          match = s.colorways.find(x => {
            return x && x.id === args.id;
          });
          if (match) {
            return match;
          }
        }
      }
      return match;
    }
  }
};
