<template>
  <div>
    <div v-if="wishlistImg !== ''">
      <a :href="wishlistImg" download>
        <img :src="wishlistImg" alt="image" class="img-thumbnail" />
      </a>
    </div>
    <table class="table-auto">
      <tr>
        <td class="text-center">
          <button
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 border border-green-700 rounded"
            @click="generateWishlist"
          >
            Generate wishlist
          </button>
        </td>
        <td></td>
      </tr>

      <tr v-for="a in this.myWishlist" v-bind:key="a.id">
        <td class="w-1/2 px-2 py-2"><img class="h-32  object-cover mx-auto rounded-lg" :src="a.img" /></td>
        <td class="px-4 py-2">{{ a.artist }} {{ a.sculpt }} {{ a.colorway }}</td>
        <td>
          <button
            @click="rmWishlist(a.id)"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 border border-red-700 rounded"
          >
            X
          </button>
        </td>
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
      console.log("generateWishlist");
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
