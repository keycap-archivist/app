const isProd = process.env.NODE_ENV === "production";
module.exports = {
  publicPath: isProd ? "." : "/",
  configureWebpack: {
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000
      }
    }
  },
  pwa: {
    name: "Artisans Catalog",
    manifestOptions: {
      start_url: "/",
      scope: "/"
    },
    themeColor: "#b6d23d",
    msTileColor: "#000000",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black",
    workboxPluginMode: "GenerateSW"
  }
};
