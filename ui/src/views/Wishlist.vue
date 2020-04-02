<template>
  <div>
    <div v-if="wishlistImg !== ''" class="my-2">
      <a :href="wishlistImg" download>
        <img :src="wishlistImg" alt="image" class="img-thumbnail" />
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
import { stringify } from "qs";
import { mapState, mapActions } from "vuex";
export default {
  name: "catalog",
  methods: {
    ...mapActions(["rmWishlist"]),
    generateWishlist() {
      this.wishlistImg = `${process.env.VUE_APP_API_URL}/v1?${stringify({ ids: this.wishlistItems.join(",") })}`;
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
    wishlistImg: ""
  })
};
</script>

<style></style>
