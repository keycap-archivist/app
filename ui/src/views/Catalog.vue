<template>
  <div>
    <div class="mb-5">
      <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
        Search something
      </label>
      <v-select
        :filterable="false"
        :options="searchResultPaginated"
        label="displayName"
        @search="search"
        @input="setSelected"
        @open="onOpen"
        @close="onClose"
      >
        <template #list-footer>
          <li ref="load" class="loader"></li>
        </template>
      </v-select>
    </div>
    <div class="mx-auto w-auto overflow-hidden mb-5 h-64" v-show="previewImgSrc !== ''">
      <lazyloadImg v-if="previewImgSrc !== ''" v-bind:src="previewImgSrc" />
    </div>
    <div style="margin-bottom:70px">
      <perfect-scrollbar v-on:ps-y-reach-end="endOfScroll">
        <div class="h-64">
          <ul>
            <li
              v-for="item in this.displayResults"
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
  </div>
</template>

<script>
import vue from "vue";
import { mapState, mapActions } from "vuex";
import { PerfectScrollbar } from "vue2-perfect-scrollbar";
import lazyloadImg from "../components/lazyloadImg.vue";
export default {
  name: "catalog",
  components: {
    PerfectScrollbar,
    lazyloadImg
  },
  mounted() {
    this.observer = new IntersectionObserver(this.infiniteScroll);
  },
  computed: {
    ...mapState(["db", "wishlistItems"]),
    searchResultPaginated() {
      return this.searchResultFiltered.slice(0, this.searchLimit);
    },
    searchResultFiltered() {
      return this.searchResult;
    },
    hasNextPage() {
      return this.searchResultPaginated.length < this.searchResultFiltered.length;
    }
  },
  methods: {
    async onOpen() {
      await this.$nextTick();
      this.observer.observe(this.$refs.load);
    },
    onClose() {
      this.observer.disconnect();
    },
    ...mapActions(["addWishlist", "rmWishlist"]),
    // Infinite Scroll Result
    endOfScroll() {
      if (this.results.length) {
        const start = this.displayResults.length;
        const max = this.results.length;
        for (let i = start; i < start + 20; i++) {
          if (i < max) {
            this.displayResults.push(this.results[i]);
          }
        }
      }
    },
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
    setSelected(value) {
      this.displayResults.length = 0;
      this.results.length = 0;
      // Deselection event
      if (!value) {
        return;
      }
      if (value.type === "colorway") {
        // In case of colorway we directly show it
        this.displayResults = [value];
        this.showCap(value.img);
      } else if (value.type === "sculpt") {
        // In case of sculpt Selection we show all the colorways
        vue.nextTick(() => {
          this.results = this.db
            .map(a => {
              const r = a.sculpts.find(s => s.id === value.ident);
              if (r) {
                let idx = 0;
                return r.colorways.map(c => {
                  const out = { ...c };
                  out.idx = idx++;
                  if (!c.name.trim()) {
                    out.name = "No Name";
                  }
                  return out;
                });
              }
            })
            .filter(x => x)[0];
          this.endOfScroll();
          this.showCap(this.displayResults[0].img);
        });
      } else {
        // In case of Artist Selection we show all the sculpts and colorways
        vue.nextTick(() => {
          const o = [
            ...this.db
              .map(a => {
                if (a.id === value.ident) {
                  return a.sculpts;
                }
              })
              .filter(x => x)[0]
              .map(r =>
                r.colorways.map(c => {
                  const out = { ...c };
                  out.name = `${r.name} ${c.name}`;
                  return out;
                })
              )
          ];
          let idx = 0;
          o.forEach(i => {
            this.results = [...this.results, ...i].map(e => {
              e.idx = idx++;
              return e;
            });
          });
          this.endOfScroll();
          this.showCap(this.displayResults[0].img);
        });
      }
    },
    async infiniteScroll([{ isIntersecting, target }]) {
      if (isIntersecting) {
        const ul = target.offsetParent;
        const scrollTop = target.offsetParent.scrollTop;
        this.searchLimit += 10;
        await this.$nextTick();
        ul.scrollTop = scrollTop;
      }
    },
    async search(q) {
      this.searchResultFiltered.length = 0;
      this.searchLimit = 20;
      const artistResult = [];
      const sculptResult = [];
      const cwResult = [];
      const sanitizedSearch = q.toLowerCase().trim();
      let i = 0;
      for (const a of this.db) {
        i++;
        let addAllScupts = false;
        if (this.isMatch(a.name, sanitizedSearch)) {
          addAllScupts = true;
          artistResult.push({
            id: i,
            ident: a.id,
            name: `${a.name}`,
            displayName: `Artist: ${a.name}`,
            type: "artist"
          });
        }
        for (const s of a.sculpts) {
          i++;
          let addAllcolorways = false;
          if (this.isMatch(s.name, sanitizedSearch) || addAllScupts) {
            addAllcolorways = true;
            sculptResult.push({
              id: i,
              ident: s.id,
              name: `${s.name}`,
              displayName: `Sculpt: ${a.name} ${s.name}`,
              type: "sculpt"
            });
          }
          for (const c of s.colorways) {
            i++;
            if (this.isMatch(c.name, sanitizedSearch) || addAllcolorways) {
              cwResult.push({
                id: i,
                ident: c.id,
                name: `${c.name}`,
                img: c.img,
                displayName: `Colorway: ${s.name} ${c.name}`,
                type: "colorway"
              });
            }
          }
        }
      }
      await this.$nextTick();

      this.searchResult = [...artistResult, ...sculptResult, ...cwResult];
    },
    isMatch(input, search) {
      return input.toLowerCase().indexOf(search) > -1;
    }
  },
  data: () => ({
    searchLimit: 20,
    observer: null,
    previewImgSrc: "",
    researchInput: "",
    selectedSearch: "",
    results: [],
    displayResults: [],
    searchResult: []
  })
};
</script>
