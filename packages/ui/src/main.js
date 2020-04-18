import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router.js";
import { VueSpinners } from "@saeris/vue-spinners";
import PerfectScrollbar from "vue2-perfect-scrollbar";
import "vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css";
import { Plugin } from "vue-fragment";
import vSelect from "vue-select";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faSkullCrossbones, faCheck, faAlignJustify } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import Mint from "mint-ui";
import "mint-ui/lib/style.css";

library.add(faSkullCrossbones);
library.add(faAlignJustify);
library.add(faCheck);

Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.component("v-select", vSelect);

Vue.use(Mint);
Vue.use(Plugin);
Vue.use(PerfectScrollbar);
Vue.use(VueSpinners);

Vue.config.productionTip = false;

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount("#app");
