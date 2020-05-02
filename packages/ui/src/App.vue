<template>
  <div class="flex md:flex-row-reverse flex-wrap">
    <div class="w-full md:w-10/12 lg:w-10/12 bg-gray-100">
      <div class="bg-gray-100 pt-2 md:pt-4 lg:w-8/12 xl:w-6/12">
        <div v-if="!rdy && !broken" class="text-center">
          <span>Application is currently loading</span>
          <ScaleLoader />
        </div>
        <div v-if="!rdy && broken" class="text-center">
          <span>Oh snap! Diz iz broken!</span>
        </div>
        <router-view v-if="rdy" />
      </div>
    </div>
    <Sidebar />
  </div>
</template>

<script>
import Vue from "vue";
import Sidebar from "./components/Sidebar.vue";
import { ScaleLoader } from "@saeris/vue-spinners";
import { mapActions, mapState } from "vuex";
export default {
  name: "App",
  components: {
    Sidebar,
    ScaleLoader
  },
  computed: {
    ...mapState(["flattennedDb", "dbVersion"])
  },
  async created() {
    try {
      const distantVersion = await this.loadDbVersion();
      if (!this.flattennedDb.length) {
        await this.loadDb();
        this.setDbVersion(distantVersion);
      } else {
        if (distantVersion !== this.dbVersion) {
          await this.loadDb();
          this.setDbVersion(distantVersion);
        }
      }
      Vue.nextTick(() => {
        this.rdy = true;
      });
    } catch (e) {
      Vue.nextTick(() => {
        this.broken = true;
      });
    }
  },
  methods: {
    ...mapActions(["loadDb", "loadDbVersion", "setDbVersion"])
  },
  data: () => ({
    rdy: false,
    broken: false
  })
};
</script>

<style lang="scss">
@import "./assets/scss/style.scss";
@import "./assets/css/tailwind.css";
</style>
