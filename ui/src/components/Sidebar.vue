<template>
  <div
    class="w-full md:w-1/12 bg-gray-900 md:bg-gray-900 px-2 text-center fixed bottom-0 md:pt-0 md:top-0 md:left-0 h-12 md:h-screen md:border-r-4 md:border-gray-600"
  >
    <div class="md:relative mx-auto lg:float-right lg:px-6">
      <ul class="list-reset flex flex-row md:flex-col text-center md:text-left">
        <li class="mr-3 flex-1">
          <router-link tag="a" to="/" class="block py-1 md:py-3 pl-1 align-middle" :class="isActive('catalog', 'link')">
            <i class="fas fa-link pr-0 md:pr-3 text-yellow-500"></i
            ><span class="pb-1 md:pb-0 text-base block md:inline-block" :class="isActive('catalog', 'span')"
              >Catalog</span
            >
          </router-link>
        </li>
        <li class="mr-3 flex-1">
          <router-link
            tag="a"
            to="/wishlist"
            class="block py-1 md:py-3 pl-1 align-middle"
            :class="isActive('wishlist', 'link')"
          >
            <i class="fas fa-link pr-0 md:pr-3"></i>
            <span class="pb-1 md:pb-0 text-base block md:inline-block" :class="isActive('wishlist', 'span')"
              >WishList</span
            >
          </router-link>
        </li>
        <li class="mr-3 flex-1">
          <a
            href="/api"
            class="block py-1 md:py-3 pl-1 align-middle text-gray-800 no-underline hover:text-yellow-500 border-b-2 border-gray-800 md:border-gray-900 hover:border-yellow-500"
          >
            <i class="fas fa-link pr-0 md:pr-3"></i>
            <span class="pb-1 md:pb-0 text-base text-gray-600 md:text-gray-400 block md:inline-block">API Doc</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {},
  methods: {
    isActive(name, type) {
      if (this.$route.name === name) {
        if (type === "link") {
          return ["text-white", "no-underline", "hover:text-white", "border-b-2", "border-yellow-600"].join(" ");
        } else {
          return ["text-white", "font-bold"].join(" ");
        }
      } else {
        if (type === "link") {
          return [
            "text-gray-800",
            "no-underline",
            "hover:text-yellow-500",
            "border-b-2",
            "border-gray-800",
            "md:border-gray-900",
            "hover:border-yellow-500"
          ].join(" ");
        } else {
          return ["text-gray-600", "md:text-gray-400"].join(" ");
        }
      }
    }
  }
};
</script>

<style></style>
