import { gql } from 'apollo-server-fastify';
import { readFileSync } from 'fs';
import { join } from 'path';

const gqlStr = readFileSync(join(__dirname, 'schema.gql'), 'utf-8');
export const typeDefs = gql`
  ${gqlStr}
`;

type Artist = {
  name: string;
  instagram?: String;
  discord?: String;
  website?: String;
};

type Sculpt = {
  name: string;
};

type Colorway = {
  name: string;
  number?: Number;
  img?: string;
};

export const resolvers = {
  Query: {
    allArtists: (): Artist[] => {
      return [];
    },
    allSculpts: (): Sculpt[] => {
      return [];
    },
    allColorways: (): Colorway[] => {
      return [];
    },
    artist: (): Artist => {
      return { name: 'artist' };
    },
    sculpt: (): Sculpt => {
      return { name: 'sculpt' };
    },
    colorway: (): Colorway => {
      return { name: 'colorway' };
    }
  }
};
