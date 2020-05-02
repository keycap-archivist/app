<template>
  <div class="px-2 mb-16 md:px-6">
    <wishlistImgComponent v-if="wishlistImg != ''" v-bind:src="wishlistImg" />
    <div>
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="wishlistname">
          Wishlist Title
        </label>
        <input
          class="shadow appearance-none border border-gray-100 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="wishlistname"
          v-model="wishlistName"
          type="text"
          placeholder="Wishlist"
        />
      </div>
      <div class="mb-4">
        <label class="block text-gray-700 border-gray-100 text-sm font-bold mb-2" for="extraText">
          Extra text
        </label>
        <input
          class="shadow appearance-none border rounded border-gray-100 w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="extraText"
          v-model="extraText"
          type="text"
          placeholder="Contact me u/foobar"
        />
      </div>
      <div class="mb-4">
        <div class="flex flex-wrap mt-2">
          <div class="w-1/2 pr-2">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="capsPerLine">
              Number keycap per line
            </label>
            <input
              id="capsPerLine"
              class="shadow appearance-none border border-gray-100 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              v-model="capsPerLine"
            />
          </div>
          <div class="w-1/2 pr-2">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="textColor">
              Title Police
            </label>
            <select
              id="titlePolice"
              class="shadow appearance-none border border-gray-100 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="select"
              v-model="titlePolice"
            >
              <option v-for="police in ['RedRock', 'Roboto']" :key="police" :value="police">{{ police }}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="mb-4">
        <div class="flex flex-wrap mt-2">
          <div class="w-1/3 pr-2">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="titleColor">
              Title Color
            </label>
            <select
              id="titleColor"
              class="shadow appearance-none border border-gray-100 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="select"
              v-model="titleColor"
            >
              <option v-for="color in cssColors" :key="color" :value="color">{{ color }}</option>
            </select>
          </div>
          <div class="w-1/3 pr-2">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="textColor">
              Text Color
            </label>
            <select
              id="textColor"
              class="shadow appearance-none border border-gray-100 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="select"
              v-model="textColor"
            >
              <option v-for="color in cssColors" :key="color" :value="color">{{ color }}</option>
            </select>
          </div>
          <div class="w-1/3 pr-2">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="bgColor">
              Background Color
            </label>
            <select
              id="bgColor"
              class="shadow appearance-none border border-gray-100 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="select"
              v-model="bg"
            >
              <option v-for="color in cssColors" :key="color" :value="color">{{ color }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div>
      <p class="text-center mb-2">{{ wishlistArray.length }} caps in Wishlist</p>
    </div>
    <button
      class="w-full mb-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-2 border border-yellow-700 rounded"
      @click="generateWishlist"
    >
      Generate wishlist
    </button>
    <span v-if="!wishlistArray.length">Nothing in wishlist yet.</span>
    <draggable v-model="wishlistArray" handle=".handle">
      <div class="w-full flex mb-2 " v-for="a in this.wishlistArray" v-bind:key="a.id">
        <div class="w-1/12 cursor-move text-center self-center handle">
          <font-awesome-icon icon="align-justify" />
        </div>
        <div class="w-3/12  cursor-resize mr-2">
          <img class="h-24 object-cover rounded-lg" :src="getCapImg(a)" />
        </div>
        <div class="w-5/12 self-center ">{{ a.artist }} {{ a.sculpt }} {{ a.colorway }}</div>
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
// TODO : Save wishlist parameters in localstorage
// TODO : Find a way to display image from POST requests
import { MessageBox } from "mint-ui";
import { cssColors } from "../utils/misc";
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
          titleColor: this.titleColor,
          bg: this.bg,
          titlePolice: this.titlePolice,
          textColor: this.textColor,
          capsPerLine: this.capsPerLine,
          extraText: this.extraText
        })}`;
      });
    }
  },
  computed: {
    cssColors() {
      return cssColors;
    },
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
    titleColor: "Red",
    titlePolice: "RedRock",
    bg: "Black",
    textColor: "White",
    wishlistName: "",
    extraText: "",
    capsPerLine: 3
  })
};
</script>

<style></style>
