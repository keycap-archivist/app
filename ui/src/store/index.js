import Vue from "vue";
import Vuex from "vuex";
import Axios from "axios";
import { stringify } from "qs";

Vue.use(Vuex);

export const backend_baseurl = process.env.VUE_APP_API_URL;

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {
    async genWishlist(_, parameters) {
      const data = await Axios.request({
        method: "GET",
        responseType: "arraybuffer",
        url: `${backend_baseurl}/api/v1/?${stringify(parameters)}`
      }).then(r => {
        return r.data;
      });
      return Buffer.from(data).toString("base64");
    }
  },
  modules: {}
});
