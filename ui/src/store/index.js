import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import app from "./modules/app.js";
import { localStorageLoad, localStorageSet, CONSTS } from "../utils/localstorage.js";

Vue.use(Vuex);

export const backend_baseurl = process.env.VUE_APP_API_URL;

function loadLocalDb() {
  const localDb = localStorageLoad(CONSTS.db);
  if (localDb) {
    try {
      return JSON.parse(localDb);
    } catch (e) {
      return {};
    }
  }
  return {};
}

function loadLocalDbVersion() {
  const localDbVersion = localStorageLoad(CONSTS.dbVersion);
  if (localDbVersion) {
    return localDbVersion;
  }
  return null;
}

function loadLocalWishlist() {
  const localWishlist = localStorageLoad(CONSTS.wishlist);
  if (localWishlist) {
    try {
      return JSON.parse(localWishlist).filter(x => !!x);
    } catch (e) {
      return [];
    }
  }
  return [];
}

function loadLocalWishlistPriorities() {
  const prios = localStorageLoad(CONSTS.wishlistPriorities);
  if (prios) {
    try {
      return JSON.parse(prios).filter(x => !!x);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export default new Vuex.Store({
  modules: {
    app
  },
  state: {
    db: loadLocalDb(),
    dbVersion: loadLocalDbVersion(),
    wishlistItems: loadLocalWishlist(),
    wishlistName: "",
    wishlistPriorities: loadLocalWishlistPriorities(),
    wishlistParams: {}
  },
  getters: {
    // Might consider having a flattened version of DB
    wishlistParsed: state => {
      const temp = [];

      // Get all the items in a temporary array
      for (const a of state.db) {
        for (const s of a.sculpts) {
          for (const c of s.colorways) {
            if (state.wishlistItems.includes(c.id)) {
              temp.push({
                id: c.id,
                colorway: c.name,
                artist: a.name,
                sculpt: s.name,
                img: c.img
              });
            }
          }
        }
      }
      // this map make the order possible
      return state.wishlistItems.map(x => {
        const cap = temp.find(z => z.id === x);
        cap.isPrioritized = state.wishlistPriorities.includes(cap.id);
        return cap;
      });
    }
  },
  mutations: {
    setDb(state, _db) {
      state.db = _db;
    },
    setDbVersion(state, _version) {
      state.dbVersion = _version;
    },
    rmPriority(state, _id) {
      const index = state.wishlistPriorities.indexOf(_id);
      if (index > -1) {
        state.wishlistPriorities.splice(index, 1);
      }
      state.wishlistPriorities = state.wishlistPriorities.filter(x => !!x);
      Vue.set(state.wishlistPriorities, state.wishlistPriorities);
      localStorageSet(CONSTS.wishlistPriorities, JSON.stringify(state.wishlistItems));
    },
    addPriority(state, _id) {
      Vue.set(state.wishlistPriorities, state.wishlistPriorities.length, _id);
      localStorageSet(CONSTS.wishlistPriorities, JSON.stringify(state.wishlistPriorities));
    },
    rmWishlist(state, _id) {
      const index = state.wishlistItems.indexOf(_id);
      if (index > -1) {
        state.wishlistItems.splice(index, 1);
      }
      state.wishlistItems = state.wishlistItems.filter(x => !!x);
      Vue.set(state.wishlistItems, state.wishlistItems);
      localStorageSet(CONSTS.wishlist, JSON.stringify(state.wishlistItems));
    },
    addWishlist(state, _id) {
      Vue.set(state.wishlistItems, state.wishlistItems.length, _id);
      localStorageSet(CONSTS.wishlist, JSON.stringify(state.wishlistItems));
    },
    setWishlist(state, wishlistArray) {
      state.wishlistItems.splice(0);
      wishlistArray.forEach(e => {
        state.wishlistItems.push(e);
      });
      localStorageSet(CONSTS.wishlist, JSON.stringify(state.wishlistItems));
    }
  },
  actions: {
    rmWishlist({ state, commit }, _id) {
      if (state.wishlistItems.indexOf(_id) > -1) {
        commit("rmWishlist", _id);
      }
    },
    addWishlist({ state, commit }, _id) {
      if (state.wishlistItems.indexOf(_id) === -1) {
        commit("addWishlist", _id);
      }
    },
    setDbVersion({ commit }, _version) {
      commit("setDbVersion", _version);
      localStorageSet(CONSTS.dbVersion, _version);
    },
    async loadDb({ commit }) {
      const db = await axios({
        url: `${backend_baseurl}/graphql`,
        method: "POST",
        data: {
          query: `
          query allArtists {
            allArtists {
              id
              name
              sculpts {
                id
                name
                colorways {
                  name
                  id
                  img
                }
              }
            }
          }
            `
        }
      }).then(result => {
        return result.data.data.allArtists;
      });
      commit("setDb", db);
      localStorageSet(CONSTS.db, JSON.stringify(db));
    },
    async loadDbVersion() {
      const version = await axios({
        url: `${backend_baseurl}/graphql`,
        method: "POST",
        data: {
          query: `
      query allArtists {
        dbVersion
      }
        `
        }
      }).then(result => {
        return result.data.data.dbVersion;
      });
      return version;
    }
  }
});
