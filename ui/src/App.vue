<template>
  <div class="flex md:flex-row-reverse flex-wrap">
    <div class="w-full md:w-10/12 bg-gray-100">
      <div class="container bg-gray-100 pt-16 px-6">
        <Main />
      </div>
    </div>
    <Sidebar />
  </div>
</template>

<script>
import Main from "./components/Main.vue";
import Sidebar from "./components/Sidebar.vue";
import { mapActions, mapState } from "vuex";
export default {
  name: "App",
  components: {
    Main,
    Sidebar
  },
  computed: {
    ...mapState(["db", "dbVersion"])
  },
  async mounted() {
    if (!this.db) {
      console.log("No local db. Loading");
      this.loadDb();
    } else {
      const distantVersion = await this.loadDbVersion();
      if (distantVersion !== this.dbVersion) {
        console.log("Distant version different. Updating db");
        this.loadDb();
      }
    }
  },
  methods: {
    ...mapActions(["loadDb", "loadDbVersion"])
  },
  data: () => ({})
};
</script>

<style lang="scss">
@import "./assets/scss/style.scss";
@import "./assets/css/tailwind.css";
</style>
