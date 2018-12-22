'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

module.exports = {
  dev: {

    // Paths
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    proxyTable: {},

    // Various Dev Server settings
    host: 'localhost', // can be overwritten by process.env.HOST
    port: 8080, // can be overwritten by process.env.PORT, if port is in use, a free one will be determined
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false, // https://webpack.js.org/configuration/dev-server/#devserver-watchoptions-


    /**
     * Source Maps
     */

    // https://webpack.js.org/configuration/devtool/#development
    devtool: 'cheap-module-eval-source-map',

    // If you have problems debugging vue-files in devtools,
    // set this to false - it *may* help
    // https://vue-loader.vuejs.org/en/options.html#cachebusting
    cacheBusting: true,

    cssSourceMap: true
  },

  build: {
    // Template for index.html
    index: path.resolve(__dirname, '../dist/index.html'),

    // Paths
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',

    /**
     * Source Maps
     */

    productionSourceMap: true,
    // https://webpack.js.org/configuration/devtool/#production
    devtool: '#source-map',

    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],

    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  nodeInfo:
    [
      "enode://21e6344b3f21095796bc5a66cc709edef739eccc3b0448e38c3b8c17da2d72fb4b929131ac5ffce102560f1fd357ab7eccda897dd2eaa7570abca852ec1e5744@127.0.0.1:30303",
      "enode://e15c1ca927cdee306301edf431879795937dfa49fa5d007ef98fc6ab49f0a02ac041fcab807bd64112024c754fc97da04b5a2181238c1652979602938eeed562@127.0.0.1:30304",
      "enode://fc550a7c567ed0071611ee79f8dcf324840db00a3aefb58b132f3cff801cf30da679b961885b264921dc8b98c2a3c06cb077df87867ec6c80be6d00a975fdbf5@127.0.0.1:30305",
      "enode://c210aec5c712b995f8480eff1a7e8af5600b974481964fd25fe7807c030d52ac8351d521f6ccf705aea61269291f05eab0fbb79a1bd0f4ed0178238aa95beddf@127.0.0.1:30306"
    ],
  contractInterface: [{ "constant": true, "inputs": [{ "name": "i", "type": "uint256" }], "name": "exposureByIndex", "outputs": [{ "name": "", "type": "string" }, { "name": "", "type": "string" }, { "name": "", "type": "string" }, { "name": "", "type": "uint256" }, { "name": "", "type": "string" }, { "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "i", "type": "uint256" }], "name": "superviseeByIndex", "outputs": [{ "name": "", "type": "string" }, { "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "addr", "type": "address" }], "name": "useraddrExist", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "userInfo", "outputs": [{ "name": "", "type": "string" }, { "name": "", "type": "uint256" }, { "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "exposureAmount", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "index", "type": "uint256" }, { "name": "reply", "type": "string" }], "name": "replyExposure", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "name", "type": "string" }], "name": "usernameExist", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "name", "type": "string" }, { "name": "supervisee", "type": "bool" }], "name": "userRegister", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "superviseeName", "type": "string" }, { "name": "detail", "type": "string" }], "name": "createExposure", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "username", "type": "string" }], "name": "exposureIndexesByName", "outputs": [{ "name": "", "type": "uint256[]" }, { "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "superviseeIndexes", "outputs": [{ "name": "", "type": "uint256[]" }, { "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "name", "type": "string" }, { "indexed": false, "name": "time", "type": "uint256" }], "name": "userRegisterEvent", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "index", "type": "uint256" }, { "indexed": false, "name": "superviserName", "type": "string" }, { "indexed": false, "name": "superviseeName", "type": "string" }, { "indexed": false, "name": "detail", "type": "string" }, { "indexed": false, "name": "time", "type": "uint256" }], "name": "createExposureEvent", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "index", "type": "uint256" }, { "indexed": false, "name": "reply", "type": "string" }, { "indexed": false, "name": "time", "type": "uint256" }], "name": "replyExposureEvent", "type": "event" }],
  contractAddress: '0x334d2c8ebcf9e06fb9ba87482e5857067cb4357c'
}
