<template>
  <div class="hello">
    <div class="container" :key="a.artisan_id" v-for="a in artisans">
      <img :alt="`${a.maker} ${a.sculpt}`" v-lazy="a.image" />
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Main",
  mounted() {
    axios
      .get("https://a.mrkeebs.com/api/artisans?perPage=5&order=artisan_id+DESC")
      .then(resp => {
        if (resp.status === 200) {
          this.artisans = resp.data;
        }
      });
  },
  data() {
    return {
      artisans: []
    };
  },
  methods: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*
image[lazy="loading"] {
  width: 40px;
  height: 300px;
  margin: auto;
}
*/
.container {
  width: 400px;
  height: 300px;
}
.container img {
  width: 100%;
  height: auto;
}
</style>
