<template>
  <div>
    <div v-if="wishlistImg !== ''" class="my-2">
      <div v-show="!imgLoaded" class="text-center">
        <span>Generating the wishlist</span>
        <ScaleLoader />
      </div>
      <a :href="wishlistImg" download v-show="imgLoaded">
        <img :src="wishlistImg" alt="image" class="img-thumbnail" v-on:load="loadedEvent" />
      </a>
    </div>
    <table class="table-auto">
      <tr>
        <td class="text-center" colspan="3">
          <button
            class="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-2 border border-yellow-700 rounded"
            @click="generateWishlist"
          >
            Generate wishlist
          </button>
        </td>
        <td></td>
      </tr>

      <tr v-for="a in this.myWishlist" v-bind:key="a.id">
        <td class="w-2/5 py-2 text-left"><img class="h-32  object-cover rounded-lg" :src="a.img" /></td>
        <td class="px-1 ">{{ a.artist }} {{ a.sculpt }} {{ a.colorway }}</td>
        <td>
          <button
            @click="rmWishlist(a.id)"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 border border-red-700 rounded"
          >
            X
          </button>
        </td>
      </tr>
      <tr v-show="!this.myWishlist.length">
        <td>Nothing in wishlist yet.</td>
      </tr>
    </table>
  </div>
</template>

<script>
import { ScaleLoader } from "@saeris/vue-spinners";
import { stringify } from "qs";
import { mapState, mapActions } from "vuex";
export default {
  name: "catalog",
  components: { ScaleLoader },
  methods: {
    ...mapActions(["rmWishlist"]),
    generateWishlist() {
      this.imgLoaded = false;
      this.wishlistImg = `${process.env.VUE_APP_API_URL}/v1?${stringify({ ids: this.wishlistItems.join(",") })}`;
    },
    // FIXME: Load event fired once. DOM element may need to be recreated
    loadedEvent() {
      this.imgLoaded = true;
    }
  },
  computed: {
    ...mapState(["db", "wishlistItems"]),
    myWishlist() {
      const out = [];
      for (const a of this.db) {
        for (const s of a.sculpts) {
          for (const c of s.colorways) {
            if (this.wishlistItems.includes(c.id)) {
              out.push({
                id: c.id,
                colorway: c.name,
                artist: a.name,
                sculpt: s.name,
                img: c.img
              });
            }
          }
        }
      }
      return out;
    }
  },
  data: () => ({
    imgLoaded: false,
    wishlistImg: ""
  })
};
</script>

<style></style>
