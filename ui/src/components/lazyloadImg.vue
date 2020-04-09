<template>
  <Fragment>
    <div v-show="!imgLoaded && !imgError" class="h-full text-center mt-12">
      <ScaleLoader />
    </div>
    <div v-show="imgError" class="h-full text-center">
      <p>Hey! I can't find the image.</p>
      <p style="font-size:100px">
        <font-awesome-icon icon="skull-crossbones" />
      </p>
    </div>
    <img
      v-show="imgLoaded"
      :src="src"
      alt="image"
      class="h-full object-cover mx-auto rounded-lg"
      v-on:load="loadedEvent"
      v-on:error="errorEvent"
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
    errorEvent() {
      this.imgError = true;
    },
    loadedEvent() {
      this.imgLoaded = true;
    }
  },
  data: () => ({
    imgLoaded: false,
    imgError: false
  })
};
</script>
