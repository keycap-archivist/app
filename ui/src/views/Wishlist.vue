<template>
  <div class="px-4 mb-16 ">
    <wishlistImgComponent v-if="wishlistImg != ''" v-bind:src="wishlistImg" />
    <div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="wishlistname">
          Wishlist Title
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
        <label class="block text-gray-700 text-sm font-bold mb-2" for="extraText">
          Extra text
        </label>
        <input
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="extraText"
          v-model="extraText"
          type="text"
          placeholder="Contact me u/foobar"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="capsPerLine">
          Number keycap per line
        </label>
        <input
          id="capsPerLine"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          v-model="capsPerLine"
        />
      </div>
    </div>
    <button
      class="w-full mb-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-2 border border-yellow-700 rounded"
      @click="generateWishlist"
    >
      Generate wishlist
    </button>
    <span v-if="!wishlistArray.length">Nothing in wishlist yet.</span>

    <div v-if="wishlistArray.length" class="w-full flex mb-2 ">
      <div class="w-3/12 mr-2"><span class="text-xs mb-2">(Drag the images to reorder)</span></div>
      <div class="w-6/12 self-center "></div>
      <div class="w-2/12  self-center ">
        Priority
      </div>
      <div class="w-1/12  self-center "></div>
    </div>
    <draggable v-model="wishlistArray" handle=".handle">
      <div class="w-full flex mb-2 " v-for="a in this.wishlistArray" v-bind:key="a.id">
        <div class="w-3/12 mr-2">
          <img class="h-24 object-cover rounded-lg handle cursor-pointer" :src="getCapImg(a)" />
        </div>
        <div class="w-6/12 self-center ">{{ a.sculpt }} {{ a.colorway }}</div>
        <div class="w-2/12  self-center ">
          <mt-switch v-model="a.isPrioritized" @change="priorityChange(a.id, a.isPrioritized)"></mt-switch>
        </div>
        <div class="w-1/12  self-center ">
          <button
            @click="deleteAction(a.id)"
            class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 border border-red-700 rounded"
          >
            X
          </button>
        </div>
      </div>
    </draggable>
  </div>
</template>

<script>
import { MessageBox } from "mint-ui";
import { stringify } from "qs";
import draggable from "vuedraggable";
import { mapState, mapActions, mapGetters, mapMutations } from "vuex";
import wishlistImgComponent from "../components/wishlistImg.vue";
export default {
  name: "catalog",
  components: { wishlistImgComponent, draggable },
  methods: {
    ...mapMutations(["setWishlist", "addPriority", "rmPriority"]),
    ...mapActions(["rmWishlist"]),
    priorityChange(id, e) {
      if (e) {
        this.addPriority(id);
      } else {
        this.rmPriority(id);
      }
    },
    getCapImg(cap) {
      return `${process.env.VUE_APP_API_URL}/v1/img/${cap.id}`;
    },
    deleteAction(id) {
      MessageBox({
        confirmButtonText: "Yes",
        cancelButtonText: "Cancel",
        showCancelButton: true,
        showConfirmButton: true,
        title: "Remove keycap",
        message: "Are you sure you want to delete this keycap from your wishlist?"
      }).then(action => {
        if (action === "confirm") {
          this.rmWishlist(id);
        }
      });
    },
    generateWishlist() {
      this.wishlistImg = "";
      this.$nextTick().then(() => {
        this.wishlistImg = `${process.env.VUE_APP_API_URL}/v1?${stringify({
          ids: this.wishlistParsed.map(x => x.id).join(","),
          prio: this.wishlistParsed
            .filter(x => x.isPrioritized)
            .map(x => x.id)
            .join(","),
          titleText: this.wishlistName,
          capsPerLine: this.capsPerLine,
          extraText: this.extraText
        })}`;
      });
    }
  },
  computed: {
    ...mapGetters(["wishlistParsed"]),
    ...mapState(["db", "wishlistItems", "wishlistPriorities"]),
    wishlistArray: {
      get() {
        return this.wishlistParsed;
      },
      set(value) {
        this.setWishlist(value.map(x => x.id));
      }
    }
  },
  data: () => ({
    imgLoaded: false,
    wishlistImg: "",
    wishlistName: "",
    extraText: "",
    capsPerLine: 3
  })
};
</script>

<style></style>
