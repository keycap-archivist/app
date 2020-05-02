<template>
  <div>
    <div class="px-2 mb-1 md:px-6">
      <div class="flex flex-wrap mt-2">
        <div class="w-1/2 pr-2 mb-2">
          <label class="block text-gray-700 text-sm font-bold mb-2">
            Artist:
          </label>
          <select
            v-model="selectedArtist"
            class=" block appearance-none w-full bg-gray-200 border border-gray-100 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option v-for="option in artistSearchList" v-bind:value="option.value" :key="option.id">
              {{ option.text }}</option
            ></select
          >
        </div>
        <div class="w-1/2" v-if="selectedArtist !== null">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="">
            Sculpt:
          </label>
          <select
            v-model="selectedSculpt"
            @change="selectSculpt"
            class=" block appearance-none w-full bg-gray-200 border border-gray-100 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option v-for="option in sculptSearchList" v-bind:value="option.value" :key="option.id">
              {{ option.text }}</option
            ></select
          >
        </div>
      </div>
      <label class="block text-gray-600 text-sm font-bold mb-2" for="freeSearch">
        Search:
      </label>
      <input
        type="text"
        v-model="researchInput"
        v-on:input="search"
        class=" block appearance-none w-full bg-gray-200 border border-gray-100 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
      />
      <div>
        <span v-if="selectedCap" class="text-xs">(double tap on cap to add to wishlist)</span>
      </div>
    </div>
    <div
      class="mx-auto w-auto overflow-hidden mb-5 px-6 cursor-pointer noSelect"
      style="height:32vh"
      v-show="selectedCap"
      @click="clickCap"
    >
      <font-awesome-icon
        icon="check"
        style="color:green;position:absolute"
        v-if="selectedCap"
        v-show="inWishlist(selectedCap.ident)"
      />
      <lazyloadImg v-if="selectedCap !== null" v-bind:src="previewImgSrc" />
    </div>
    <div style="margin-bottom:70px;" class="md:px-6">
      <perfect-scrollbar v-on:ps-y-reach-end="endOfScroll">
        <div style="height:42vh">
          <ul>
            <li
              v-for="item in this.displayResults"
              :key="item.idx"
              class="cursor-pointer result pl-2"
              @click="showCap(item)"
              v-bind:class="{ selected: isActive(item.ident) }"
            >
              {{ item.name }}
            </li>
          </ul>
        </div>
      </perfect-scrollbar>
    </div>
  </div>
</template>

<script>
import { Toast } from "mint-ui";
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
    this.displayResults = this.rngCaps(5);
    this.showCap(this.displayResults[0]);
  },
  computed: {
    ...mapState(["flattennedDb", "wishlistItems"]),
    previewImgSrc() {
      return this.selectedCap !== null ? `${process.env.VUE_APP_API_URL}/v1/img/${this.selectedCap.ident}` : null;
    },
    artistSearchList() {
      const out = [];
      out.push({
        value: null,
        text: "Select an Artist"
      });
      for (const c of this.flattennedDb) {
        if (!out.find(x => x.value === c.artistId)) {
          out.push({
            value: c.artistId,
            text: c.artistName
          });
        }
      }
      return out;
    },
    sculptSearchList() {
      const out = [];
      for (const c of this.flattennedDb) {
        if (c.artistId === this.selectedArtist && !out.find(x => x.value === c.sculptId)) {
          out.push({
            value: c.sculptId,
            text: c.sculptName
          });
        }
      }
      return out;
    }
  },
  methods: {
    rngInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    },
    rngCap(currentCaps) {
      const ids = currentCaps.map(x => x.ident);
      const dbLength = this.flattennedDb.length;
      for (;;) {
        const outCap = this.flattennedDb[this.rngInt(dbLength)];
        if (outCap && !ids.includes(outCap.id)) {
          outCap.name = `${outCap.artistName} ${outCap.sculptName} ${outCap.colorwayName}`;
          outCap.ident = outCap.id;
          return outCap;
        }
      }
    },
    rngCaps(nbCap) {
      const output = [];
      for (let i = 0; i < nbCap; i++) {
        output.push(this.rngCap(output));
      }
      return output;
    },
    selectSculpt() {
      this.researchInput = null;
      const cw = [];
      for (const c of this.flattennedDb.filter(x => this.selectedSculpt === x.sculptId)) {
        if (!cw.map(x => x.id).includes(c.id)) {
          c.ident = c.id;
          c.name = c.colorwayName;
          cw.push(c);
        }
      }
      this.displayResults.length = 0;
      this.results.length = 0;
      this.results = cw.sort(this.sortResults);
      this.showCap(this.results[0]);
    },
    clickCap() {
      const currentTap = Date.now();
      if (currentTap - this.lastTap < 500) {
        if (this.inWishlist(this.selectedCap.ident)) {
          Toast({ message: "Removed from wishlist", position: "bottom", duration: 900 });
          this.rmWishlist(this.selectedCap.ident);
        } else {
          Toast({ message: "Added to wishlist", position: "bottom", duration: 900 });
          this.addWishlist(this.selectedCap.ident);
        }
        this.lastTap = 0;
      } else {
        this.lastTap = currentTap;
      }
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
    isActive(ident) {
      return this.selectedCap && ident === this.selectedCap.ident;
    },
    inWishlist(id) {
      return this.wishlistItems.indexOf(id) > -1;
    },
    showCap(cap) {
      this.selectedCap = null;
      this.$nextTick().then(() => {
        this.selectedCap = cap;
      });
    },
    sortResults(a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    },
    setSelected(value) {
      this.displayResults.length = 0;
      this.results.length = 0;
      if (!value) {
        return;
      }
      this.displayResults = [value];
      this.showCap(value);
      this.selectedArtist = value.artistId;
      this.selectedSculpt = value.sculptId;
    },
    async search() {
      const q = this.researchInput;
      // in case of 1 char too much results
      // laggy on bad phones (like mine)
      if (!q || q.length == 1) {
        return;
      }
      this.searchLimit = 20;
      const r = [];
      const sanitizedSearch = q.toLowerCase().trim();
      let i = 0;
      for (const c of this.flattennedDb) {
        let push = false;
        if (this.selectedArtist !== null) {
          if (
            c.artistId === this.selectedArtist &&
            this.isMatch(`${c.sculptName} ${c.colorwayName}`, sanitizedSearch)
          ) {
            push = true;
          }
        } else if (this.selectedArtist !== null && this.selectedSculpt !== null) {
          if (c.artistId === this.selectedSculpt && this.isMatch(c.colorwayName, sanitizedSearch)) {
            push = true;
          }
        } else {
          if (this.isMatch(`${c.artistName} ${c.sculptName} ${c.colorwayName}`, sanitizedSearch)) {
            push = true;
          }
        }
        if (push) {
          // TODO : Sanitize the result format throught all components
          r.push({
            id: ++i,
            ident: c.id,
            name: `${c.artistName} ${c.sculptName} ${c.colorwayName}`,
            artistId: c.artistId,
            sculptId: c.sculptId,
            img: c.img,
            displayName: `${c.artistName} ${c.sculptName} ${c.colorwayName}`
          });
        }
      }
      await this.$nextTick();

      this.displayResults.length = 0;
      this.results.length = 0;
      this.results = r.sort(this.sortResults);
    },
    isMatch(input, search) {
      return (
        input
          .replace(/\./g, "") // filter dots in input
          .toLowerCase()
          .indexOf(search) > -1
      );
    }
  },
  data: () => ({
    lastTap: 0,
    searchLimit: 20,
    observer: null,
    researchInput: "",
    selectedCap: null,
    selectedArtist: null,
    selectedSculpt: null,
    results: [],
    displayResults: []
  })
};
</script>

<style type="text/css">
li.result {
  height: 50px;
  border-bottom: 1px solid #e9ebf5;
  line-height: 50px;
  overflow: hidden;
}
li.selected {
  background: #a1a4b9;
}
.noSelect {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
</style>
