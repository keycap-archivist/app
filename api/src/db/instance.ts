import axios from 'axios';
import { appLogger } from 'logger';

export type Artist = {
  id: string;
  name: string;
  instagram?: string;
  discord?: string;
  website?: string;
  sculpts: Sculpt[];
};

export type Sculpt = {
  id: string;
  name: string;
  colorways: Colorway[];
};

export interface SculptDetailed extends Sculpt {
  artist: Artist;
}

export interface Colorway {
  id: string;
  name: string;
  number?: number;
  img?: string;
}

export interface ColorwayDetailed extends Colorway {
  sculpt: SculptDetailed;
}

class CatalogDB {
  db: Artist[] = [];
  async init() {
    appLogger.info("Loading the JSON Catalog. This may take a moment because It's huge!");
    const _db = await axios
      .get('https://raw.githubusercontent.com/zekth/too-much-artisans-db/master/db/catalog.json')
      .then((res) => {
        return res.data;
      });
    appLogger.info('Woaw finally loaded. Ready to go');

    this.db = this.format(_db);
  }
  format(_db) {
    return _db;
  }
  getArtist(artistId: string): Artist {
    return this.db.find((x) => x.id === artistId);
  }
  getSculpt(sculptId: string): SculptDetailed {
    let match: Sculpt;
    for (const a of this.db) {
      match = a.sculpts.find((x) => {
        return x && x.id === sculptId;
      });
      if (match) {
        const out = Object.assign({}, match) as SculptDetailed;
        out.artist = { name: a.name, id: a.id, sculpts: [] };
        return out;
      }
    }
    return null;
  }
  getColorway(colorwayId: string): ColorwayDetailed {
    let match: Colorway;
    for (const a of this.db) {
      for (const s of a.sculpts) {
        match = s.colorways.find((x) => {
          return x && x.id === colorwayId;
        });
        if (match) {
          const out = Object.assign({}, match) as ColorwayDetailed;
          out.sculpt = { name: s.name, id: s.id, colorways: [], artist: { id: a.id, name: a.name, sculpts: [] } };
          return out;
        }
      }
    }
    return null;
  }
  getSculpts(artistId: string): Sculpt[] {
    const sculpts = this.db.find((x) => x.id === artistId);
    if (!sculpts) {
      return [];
    }
    return sculpts.sculpts;
  }
  getColorways(sculptId: string): Colorway[] {
    let match: Sculpt;
    for (const a of this.db) {
      match = a.sculpts.find((x) => {
        return x && x.id === sculptId;
      });
      if (match) {
        return match.colorways;
      }
    }
    return [];
  }
}

export const instance = new CatalogDB();
