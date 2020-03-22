import axios from 'axios';
import { appLogger } from 'logger';

let db;

export async function initDb() {
  appLogger.info(
    "Loading the JSON Catalog. This may take a moment because It's huge!"
  );
  db = await axios
    .get(
      'https://raw.githubusercontent.com/zekth/too-much-artisans-db/master/db/catalog.json'
    )
    .then(res => {
      return res.data;
    });
  appLogger.info('Woaw finally loaded. Ready to go');
}

export const instance = db;
