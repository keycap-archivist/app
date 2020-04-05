<template>
  <Fragment>
    <div v-show="!imgLoaded" class="h-full text-center mt-12">
      <ScaleLoader />
    </div>
    <img
      v-show="imgLoaded"
      :src="src"
      alt="image"
      class="h-full object-cover mx-auto rounded-lg"
      v-on:load="loadedEvent"
    />
  </Fragment>
</template>

<script>
import { ScaleLoader } from "@saeris/vue-spinners";
import { Fragment } from "vue-fragment";
export default {
  components: { ScaleLoader, Fragment },
  props: ["src"],
  methods: {
    loadedEvent() {
      this.imgLoaded = true;
    }
  },
  data: () => ({
    imgLoaded: false
  })
};
</script>
