import axios from 'axios';

import { appLogger } from '#app/logger';

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
  isPrioritized?: boolean;
}

interface ApiDb {
  version: string;
  data: Artist[];
}

class CatalogDB {
  db: ApiDb = { version: '', data: [] };
  async init(): Promise<void> {
    await this.loadDb();
    setInterval(this.loadDb.bind(this), 1000 * 3600);
  }
  async downloadDbVersion(): Promise<string> {
    const version = await axios
      .get('https://api.github.com/repos/keycap-archivist/database/git/ref/heads/master')
      .then((res) => {
        return res.data.object.sha;
      });
    return version;
  }
  async loadDb(): Promise<void> {
    const distantVersion = await this.downloadDbVersion();
    if (distantVersion === this.getDbVersion()) {
      appLogger.info('No Need to update db');
    } else {
      appLogger.info('Loading the JSON Catalog');
      const _db = await axios
        .get('https://cdn.keycap-archivist.com/db/catalog.json')
        .then((res) => {
          return res.data;
        });
      appLogger.info('Database updated');
      this.db = this.format(_db, distantVersion);
    }
  }
  getDbVersion(): string {
    return this.db.version;
  }
  format(_db: Artist[], version: string): ApiDb {
    const out = {
      version: version,
      data: _db
    };
    return out;
  }
  getArtist(artistId: string): Artist | undefined {
    return this.db.data.find((x) => x.id === artistId);
  }
  getSculpt(sculptId: string): SculptDetailed | undefined {
    let match: Sculpt | undefined;
    for (const a of this.db.data) {
      match = a.sculpts.find((x) => {
        return x && x.id === sculptId;
      });
      if (match) {
        const out = Object.assign({}, match) as SculptDetailed;
        out.artist = { name: a.name, id: a.id, sculpts: [] };
        return out;
      }
    }
  }
  getColorway(colorwayId: string): ColorwayDetailed | undefined {
    let match: Colorway | undefined;
    for (const a of this.db.data) {
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
  }
  getSculpts(artistId: string): Sculpt[] {
    const sculpts = this.db.data.find((x) => x.id === artistId);
    if (!sculpts) {
      return [];
    }
    return sculpts.sculpts;
  }
  getColorways(sculptId: string): Colorway[] {
    let match: Sculpt | undefined;
    for (const a of this.db.data) {
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
