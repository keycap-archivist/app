<template>
  <div>
    <h1 class="text-2xl mb-4">
      Too many artisans
      <a class="inline-block hover:text-yellow-700 mr-5" href="https://github.com/zekth/too-much-artisans">
        <svg class="fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <title>GitHub</title>
          <path
            d="M10 0a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69a3.6 3.6 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.4.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .26.18.58.69.48A10 10 0 0 0 10 0"
          ></path>
        </svg>
      </a>
    </h1>
    <p class="text-base mb-2">
      This project is based on
      <a class=" hover:text-yellow-700" href="https://keycap.info/" target="_blank">keycap.info</a> data. The aim of
      this project is to provide an easy way to browse the artisan keycaps catalogs and add those caps to a wishlist. By
      then you can generate a wishlist to copy paste it in Discord and other medias. This application is divided in 2
      parts.
    </p>
    <h2 class="text-xl mb-2">Database</h2>
    <p class="text-base mb-2">
      The database is a public JSON file exposed by github
      <a
        class=" hover:text-yellow-700"
        href="https://github.com/zekth/too-much-artisans-db/blob/master/db/catalog.json"
        target="_blank"
        >here</a
      >. Whole project is
      <a class=" hover:text-yellow-700" href="https://github.com/zekth/too-much-artisans-db" target="_blank">here</a>,
      it self update on a daily basis using a cron github workflow.
    </p>
    <h2 class="text-xl mb-2">Web Application</h2>
    <p class="text-base  mb-2">
      The application you're browsing is consuming the database exposed through a graphql API. Nothing really fancy. You
      can make wishlist, it's a processing based on node-canvas. API is documented
      <a class=" hover:text-yellow-700" href="/api" target="_blank">here</a>.
    </p>
    <h2 class="text-xl font-bold">TLDR</h2>
    <p class="text-base">
      I was bored (thanks COVID-19), i made this, enjoy.
    </p>
    <p class="text-base italic">
      Note: Please give me Nightcaps Bombking. TY<br />
      <a class="font-bold hover:text-yellow-700" href="https://github.com/zekth" target="_blank">Zekth</a>
    </p>
    <p class="text-xs italic">revision: {{ revision }}</p>
    <div class="flex justify-start items-center text-gray-500"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      revision: process.env.VUE_APP_REVISION || "dev"
    };
  }
};
</script>
