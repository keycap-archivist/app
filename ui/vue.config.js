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
  }
};
