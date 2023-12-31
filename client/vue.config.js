module.exports = {
  // https://cli.vuejs.org/zh/config/#publicpath
  publicPath: './',

  // https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
  pwa: {
    name: 'DZP',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    iconPaths: {
      favicon32: 'img/icons/dzp-32x32.png',
      favicon16: 'img/icons/dzp-16x16.png',
      maskicon: null,
      appleTouchIcon: null,
      msTileImage: null,
    },

    manifestOptions: {
      start_url: './index.html',
      display: 'minimal-ui', //'standalone', 'minimal-ui',
      icons: [
        {
          src: "./img/icons/dzp.png",
          sizes: "256x256",
          type: "image/png",
          purpose: "any maskable",
        },
      ]
    },
  }
}
