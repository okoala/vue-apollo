import Plugin from './plugin'
import { VueApollo } from './client'

function initApollo (Vue) {
  Vue.use(Plugin)
}

export { initApollo, VueApollo }
