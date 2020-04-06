<template>
  <div>
    <wishlistImgComponent v-if="wishlistImg != ''" v-bind:src="wishlistImg" />
    <div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="wishlistname">
          Wishlist Name
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="wishlistname"
          v-model="wishlistName"
          type="text"
          placeholder="Wishlist"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="capsPerLine">
          Number Caps per line
        </label>
        <input
          id="capsPerLine"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          v-model="capsPerLine"
        />
      </div>
    </div>
    <table class="table-auto mb-16 w-full">
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
      <tr>
        <td class="text-center" colspan="3">{{ myWishlist.length }} caps in wishlist</td>
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
import { stringify } from "qs";
import { mapState, mapActions } from "vuex";
import wishlistImgComponent from "../components/wishlistImg.vue";
export default {
  name: "catalog",
  components: { wishlistImgComponent },
  methods: {
    ...mapActions(["rmWishlist"]),
    generateWishlist() {
      this.wishlistImg = "";
      this.$nextTick().then(() => {
        this.wishlistImg = `${process.env.VUE_APP_API_URL}/v1?${stringify({
          ids: this.wishlistItems.join(","),
          title: this.wishlistName,
          capsPerLine: this.capsPerLine
        })}`;
      });
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
    wishlistImg: "",
    wishlistName: "",
    capsPerLine: 3
  })
};
</script>

<style></style>
