import TestView from './TestView.vue'

export function createView (type) {
  return {
    name: `${type}-stories-view`,
    // this will be called during SSR to pre-fetch data into the store!
    preFetch (store) {
      // return store.dispatch('FETCH_LIST_DATA', { type })
    },
    render (h) {
      return h(TestView, { props: { type }})
    }
  }
}
