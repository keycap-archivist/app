<template>
  <div class="my-2">
    <div v-show="!imgLoaded" class="text-center">
      <span>Generating the wishlist</span>
      <ScaleLoader />
    </div>
    <a :href="src" download v-show="imgLoaded">
      <img :src="src" alt="image" class="img-thumbnail" v-on:load="loadedEvent" />
    </a>
  </div>
</template>

<script>
import { ScaleLoader } from "@saeris/vue-spinners";
export default {
  components: { ScaleLoader },
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
