<template>
  <div class="hello">
    <input v-model="wishlistTitle" placeholder="Wishlist Title" />
    <button v-on:click="clickGenerate">Generate</button>
    <img v-bind:src="wishlistDataUrl" />
    <a download="wishlist.jpg" v-bind:href="wishlistDataUrl">Download Image</a>
    <div class="container" :key="a.artisan_id" v-for="a in artisans">
      <img :alt="`${a.maker} ${a.sculpt}`" v-lazy="a.image" />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";
export default {
  name: "Main",
  mounted() {
    const page = Math.ceil(Math.random() * 200) + 1;
    axios
      .get(
        `https://a.mrkeebs.com/api/artisans?page=${page}&perPage=6&order=artisan_id+DESC`
      )
      .then(resp => {
        if (resp.status === 200) {
          this.artisans = resp.data;
        }
      });
  },
  data() {
    return {
      wishlistDataUrl: "Wishlist",
      wishlistTitle: "",
      artisans: []
    };
  },
  methods: {
    ...mapActions(["genWishlist"]),
    clickGenerate() {
      this.genWishlist({
        ids: this.artisans
          .map(x => {
            return x.artisan_id;
          })
          .join(","),
        title: this.wishlistTitle
      }).then(datastring => {
        this.wishlistDataUrl = `data:image/png;base64,${datastring}`;
      });
    }
  }
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
