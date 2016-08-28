import * as plugin from './plugin'
import * as client from './client'
import * as apolloClient from 'apollo-client'
import applyMixin from './mixin'

let Vue

function install (_Vue) {
  if (Vue) {
    console.error(
      '[vue-apollo] already installed. Vue.use(VueApollo) should be called only once.'
    )
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

module.exports = Object.assign({ install }, apolloClient, plugin, client)
