<template>
  <div>
    <div class="mb-5">
      <form class="px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
            Search something
          </label>
          <input
            v-on:input="search"
            v-model="researchInput"
            type="text"
            placeholder="research"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </form>
    </div>
    <div class=" h-64 mx-auto w-1/2 sm:w-auto lg:w-1/2 overflow-hidden mb-5" v-show="previewImgSrc !== ''">
      <img class="h-full object-cover mx-auto rounded-lg" :src="previewImgSrc" />
    </div>
    <div class="overflow-y-scroll h-64">
      <ul>
        <li
          v-for="item in this.results"
          :key="item.idx"
          class="cursor-pointer"
          @click="showCap(item.img)"
          v-bind:class="{ 'bg-blue-500': isActive(item.img) }"
        >
          <button
            v-show="!inWishlist(item.id)"
            @click="addWishlist(item.id)"
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 border border-green-700 rounded"
          >
            Add
          </button>
          <button
            v-show="inWishlist(item.id)"
            @click="rmWishlist(item.id)"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 border border-red-700 rounded"
          >
            Remove
          </button>
          <span> {{ item.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  name: "catalog",
  computed: {
    ...mapState(["db", "wishlistItems"])
  },
  methods: {
    ...mapActions(["addWishlist", "rmWishlist"]),
    isActive(img) {
      return this.previewImgSrc === img;
    },
    inWishlist(id) {
      return this.wishlistItems.indexOf(id) > -1;
    },
    showCap(img) {
      this.previewImgSrc = img;
    },
    search() {
      this.results.length = 0;
      if (this.researchInput.length < 3) {
        return;
      }
      const sanitizedSearch = this.researchInput.toLowerCase().trim();
      let i = 0;
      for (const a of this.db) {
        let addAllScupts = false;
        if (this.isMatch(a.name, sanitizedSearch)) {
          addAllScupts = true;
        }
        for (const s of a.sculpts) {
          let addAllcolorways = false;
          if (this.isMatch(s.name, sanitizedSearch) || addAllScupts) {
            addAllcolorways = true;
          }
          for (const c of s.colorways) {
            i++;
            if (this.isMatch(c.name, sanitizedSearch) || addAllcolorways) {
              this.results.push({
                idx: i,
                id: c.id,
                name: `${a.name} ${s.name} ${c.name}`,
                img: c.img,
                type: "colorway"
              });
            }
          }
        }
      }
    },
    isMatch(input, search) {
      return input.toLowerCase().indexOf(search) > -1;
    }
  },
  data: () => ({
    previewImgSrc: "",
    researchInput: "",
    results: []
  })
};
</script>
