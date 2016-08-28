import { DollarApollo } from './plugin'

module.exports = function (Vue) {
  Vue.mixin({
    created () {
      this._apolloSubscriptions = []
      this.$apollo = new DollarApollo(this)

      const apollo = this.$options.apollo
      if (apollo) {
        // One-time queries with $query(), called each time a Vue dependency is updated (using $watch)
        if (apollo.data) {
          for (const key in apollo.data) {
            this.$apollo.option(key, apollo.data[key], false)
          }
        }

        // Auto updating queries with $watchQuery(), re-called each time a Vue dependency is updated (using $watch)
        if (apollo.watch) {
          for (const key in apollo.watch) {
            this.$apollo.option(key, apollo.watch[key], true)
          }
        }
      }
    },
    destroyed () {
      this.$apollo = null
      this._apolloSubscriptions.forEach(sub => sub.unsubscribe())
      this._apolloSubscriptions = []
    }
  })
}
