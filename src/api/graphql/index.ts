import { readFileSync } from 'fs';
import { join } from 'path';
import { instance } from 'db/instance';
import type { Artist, Sculpt, Colorway } from 'db/instance';

const gqlStr = readFileSync(join(__dirname, 'schema.gql'), 'utf-8');
export const schema = `
  ${gqlStr}
`;

export const resolvers = {
  Query: {
    dbVersion: (): string => {
      return instance.db.version;
    },
    allArtists: (): Artist[] => {
      return instance.db.data;
    },
    allSculpts: (_obj, args, _context, _info): Sculpt[] => {
      return instance.getSculpts(args.artistId);
    },
    allColorways: (_obj, args, _context, _info): Colorway[] => {
      return instance.getColorways(args.sculptId);
    },
    artist: (_obj, args, _context, _info): Artist => {
      return instance.getArtist(args.id);
    },
    sculpt: (_obj, args, _context, _info): Sculpt => {
      return instance.getSculpt(args.id);
    },
    colorway: (_obj, args, _context, _info): Colorway => {
      return instance.getColorway(args.id);
    }
  }
};
