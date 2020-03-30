<template>
  <div class="container mx-auto bg-purple">
    <a href="./api" class=" hover:underline text-blue-500 text-lg">Too much Artisans API documentation</a>
    <br />
    <div class="mb-5">
      Search: <input v-on:input="search" v-model="researchInput" type="text" placeholder="research" />
    </div>
    <div class="mx-auto w-1/2 sm:w-auto lg:w-1/2 rounded-lg overflow-hidden" v-show="previewImgSrc !== ''">
      <img class="w-full object-cover" :src="previewImgSrc" />
    </div>
    <ul>
      <li v-for="item in this.results" :key="item.idx">
        <template v-if="item.type === 'artist'"> Artist : {{ item.name }} </template>
        <template v-else-if="item.type === 'sculpt'"> Sculpt : {{ item.name }} </template>
        <template v-else>
          <button
            @click="showCap(item.img)"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 border border-blue-700 rounded"
          >
            Show
          </button>
          color : {{ item.name }}
        </template>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "maincontent",
  computed: {
    ...mapState(["db"])
  },
  methods: {
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
        i++;
        if (this.isMatch(a.name, sanitizedSearch)) {
          this.results.push({
            idx: i,
            id: a.id,
            name: a.name,
            type: "artist"
          });
        }
        for (const s of a.sculpts) {
          i++;
          if (this.isMatch(s.name, sanitizedSearch)) {
            this.results.push({
              idx: i,
              id: s.id,
              name: s.name,
              type: "sculpt"
            });
          }
          for (const c of s.colorways) {
            i++;
            if (this.isMatch(c.name, sanitizedSearch)) {
              this.results.push({
                idx: i,
                id: c.id,
                name: c.name,
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

<style></style>
