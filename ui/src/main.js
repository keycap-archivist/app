import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router.js";
import { VueSpinners } from "@saeris/vue-spinners";

Vue.use(VueSpinners);
Vue.config.productionTip = false;

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount("#app");
