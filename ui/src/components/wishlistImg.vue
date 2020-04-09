<template>
  <div class="my-2">
    <div v-show="!imgLoaded && !imgError" class="text-center">
      <span>Generating the wishlist</span>
      <ScaleLoader />
    </div>
    <div v-show="imgError" class="h-full text-center">
      <p>Hey! There is an issue generating your wishlist.</p>
      <p>Be sure that the developer is currently working on fixing this issue; or looking for some v1.5 Bombkings</p>
      <p style="font-size:100px">
        <font-awesome-icon icon="skull-crossbones" />
      </p>
    </div>
    <a :href="src" download v-show="imgLoaded">
      <img :src="src" alt="image" class="mx-auto" v-on:load="loadedEvent" v-on:error="errorEvent" />
    </a>
  </div>
</template>

<script>
import { ScaleLoader } from "@saeris/vue-spinners";
export default {
  components: { ScaleLoader },
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
