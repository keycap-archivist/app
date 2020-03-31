import Vue from "vue";
import Router from "vue-router";
import Catalog from "./views/Catalog.vue";
import Wishlist from "./views/Wishlist.vue";

Vue.use(Router);

export default new Router({
  routes: [
    { path: "/wishlist", component: Wishlist, name: "wishlist" },
    { path: "*", component: Catalog, name: "catalog" }
  ]
});
