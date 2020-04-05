import Vue from "vue";
import Vuex from "vuex";
import app from "./modules/app.js";
import { localStorageLoad, localStorageSet, CONSTS } from "../utils/localstorage.js";
import axios from "axios";

Vue.use(Vuex);

export const backend_baseurl = process.env.VUE_APP_API_URL;

function loadLocalDb() {
  const localDb = localStorageLoad(CONSTS.db);
  if (localDb) {
    try {
      return JSON.parse(localDb);
    } catch (e) {
      return null;
    }
  } else {
    return null;
  }
}

function loadLocalDbVersion() {
  const localDbVersion = localStorageLoad(CONSTS.dbVersion);
  if (localDbVersion) {
    return localDbVersion;
  } else {
    return null;
  }
}

function loadLocalWishlist() {
  const localWishlist = localStorageLoad(CONSTS.wishlist);
  if (localWishlist) {
    try {
      return JSON.parse(localWishlist);
    } catch (e) {
      return [];
    }
  } else {
    return [];
  }
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
    wishlistParams: {}
  },
  mutations: {
    setDb(state, _db) {
      Vue.set(state.db, _db);
    },
    setDbVersion(state, _version) {
      state.dbVersion = _version;
    },
    rmWishlist(state, _id) {
      const index = state.wishlistItems.indexOf(_id);
      if (index > -1) {
        state.wishlistItems.splice(index, 1);
      }
      Vue.set(state.wishlistItems, state.wishlistItems);
      localStorageSet(CONSTS.wishlist, JSON.stringify(state.wishlistItems));
    },
    addWishlist(state, _id) {
      Vue.set(state.wishlistItems, state.wishlistItems.length, _id);
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
    async loadDbVersion({ commit }) {
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
      commit("setDbVersion", version);
      localStorageSet(CONSTS.dbVersion, version);
      return version;
    }
  }
});
