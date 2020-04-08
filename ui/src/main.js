import { register } from "register-service-worker";
import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router.js";
import { VueSpinners } from "@saeris/vue-spinners";
import PerfectScrollbar from "vue2-perfect-scrollbar";
import "vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css";
import { Plugin } from "vue-fragment";
import vSelect from "vue-select";

Vue.component("v-select", vSelect);
Vue.use(Plugin);
Vue.use(PerfectScrollbar);
Vue.use(VueSpinners);

Vue.config.productionTip = false;

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount("#app");

// Service Worker
if (process.env.NODE_ENV === "production") {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log("Site is ready");
    },
    cached() {
      console.log("Content has been cached for offline use.");
    },
    updatefound() {
      console.log("New content is downloading.");
    },
    updated() {
      console.log("New content is available; Refresh...");
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
    },
    offline() {
      console.log("No internet connection found. App is running in offline mode.");
    },
    error(error) {
      console.error("Error during service worker registration:", error);
    }
  });
}
