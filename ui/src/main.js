import Vue from "vue";
import MintUI from "mint-ui";
import "mint-ui/lib/style.css";
import App from "./App.vue";
import store from "./store";

Vue.config.productionTip = false;
Vue.use(MintUI);

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
