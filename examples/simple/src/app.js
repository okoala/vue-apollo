import Vue from 'vue'
import VueApollo, { VueApolloClient, createNetworkInterface } from '../../../src/index'
import store from './store'
import router from './router'
import { sync } from 'vuex-router-sync'
// import * as filters from './filters'
import config from '../config/config.public'

Vue.use(VueApollo)

const options = {}
let url = '/graphql'
if (process.env.VUE_ENV === 'server') {
  options.ssrMode = true
  url = `http://127.0.0.1:${config.port}/graphql`
} else {
  options.ssrForceFetchDelay = 100
}

VueApolloClient.setOptions(Object.assign(
  {
    networkInterface: createNetworkInterface(url, { credentials: 'same-origin' }),
    shouldBatch: true
  },
  options
))

const App = require('./App.vue')

// sync the router with the vuex store.
// this registers `store.state.route`
sync(store, router)

// create the app instance.
// here we inject the router and store to all child components,
// making them available everywhere as `this.$router` and `this.$store`.
const app = new Vue(Object.assign({
  router,
  store
}, App)) // Object spread copying everything from App.vue

// expose the app, the router and the store.
// note we not mounting the app here, since bootstrapping will be
// different depending on whether we are in browser or on the server.
export { app, router, store }
