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

export type Colorway = {
  id: string;
  name: string;
  number?: number;
  img?: string;
};

class CatalogDB {
  db: Artist[] = [];
  async init() {
    appLogger.info(
      "Loading the JSON Catalog. This may take a moment because It's huge!"
    );
    const _db = await axios
      .get(
        'https://raw.githubusercontent.com/zekth/too-much-artisans-db/master/db/catalog.json'
      )
      .then(res => {
        return res.data;
      });
    appLogger.info('Woaw finally loaded. Ready to go');

    this.db = this.format(_db);
  }
  format(_db) {
    return _db;
  }
}

export const instance = new CatalogDB();
