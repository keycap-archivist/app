<template>
  <div class="flex md:flex-row-reverse flex-wrap">
    <div class="w-full md:w-11/12 bg-gray-100">
      <div class="container bg-gray-100 pt-4 px-6">
        <div v-if="!rdy" class="text-center">
          <span>Application is currently loading</span>
          <ScaleLoader />
        </div>
        <Main v-if="rdy" />
      </div>
    </div>
    <Sidebar />
  </div>
</template>

<script>
import Main from "./components/Main.vue";
import Vue from "vue";
import Sidebar from "./components/Sidebar.vue";
import { ScaleLoader } from "@saeris/vue-spinners";
import { mapActions, mapState } from "vuex";
import { isEmpty } from "lodash";
export default {
  name: "App",
  components: {
    Main,
    Sidebar,
    ScaleLoader
  },
  computed: {
    ...mapState(["db", "dbVersion"])
  },
  async created() {
    const distantVersion = await this.loadDbVersion();
    if (isEmpty(this.db)) {
      await this.loadDb();
    } else {
      if (distantVersion !== this.dbVersion) {
        await this.loadDb();
      }
    }
    Vue.nextTick(() => {
      this.rdy = true;
    });
  },
  methods: {
    ...mapActions(["loadDb", "loadDbVersion"])
  },
  data: () => ({
    rdy: false
  })
};
</script>

<style lang="scss">
@import "./assets/scss/style.scss";
@import "./assets/css/tailwind.css";
</style>
