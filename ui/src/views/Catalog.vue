<template>
  <div>
    <div class="" style="height:10vh">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
        Search something
      </label>
      <input
        v-on:input="search"
        v-model="researchInput"
        type="text"
        placeholder="Research"
        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
    <div class="mx-auto w-auto  overflow-hidden mb-5" style="height:30vh" v-show="previewImgSrc !== ''">
      <lazyloadImg v-if="previewImgSrc !== ''" v-bind:src="previewImgSrc" />
    </div>
    <perfect-scrollbar>
      <div class="" style="height:40vh">
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
    </perfect-scrollbar>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { PerfectScrollbar } from "vue2-perfect-scrollbar";
import lazyloadImg from "../components/lazyloadImg.vue";
export default {
  name: "catalog",
  components: {
    PerfectScrollbar,
    lazyloadImg
  },
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
      this.previewImgSrc = "";
      this.$nextTick().then(() => {
        this.previewImgSrc = img;
      });
    },
    search() {
      // FIXME: add pagination
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
