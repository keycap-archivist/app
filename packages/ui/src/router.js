import Vue from "vue";
import Router from "vue-router";
import Catalog from "./views/Catalog.vue";
import Wishlist from "./views/Wishlist.vue";
import About from "./views/About.vue";

Vue.use(Router);

export default new Router({
  routes: [
    { path: "/wishlist", component: Wishlist, name: "wishlist" },
    { path: "/about", component: About, name: "about" },
    { path: "*", component: Catalog, name: "catalog" }
  ]
});
