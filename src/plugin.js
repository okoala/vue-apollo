import { VueApolloClient } from './client'

export class DollarApollo {
  constructor (vm) {
    this.vm = vm
    this.querySubscriptions = {}
  }

  get client () {
    return VueApolloClient.client
  }

  get query () {
    return this.client.query
  }

  watchQuery (options) {
    const vm = this.vm
    const observable = this.client.watchQuery(options)

    return {
      observable,
      subscribe (options) {
        const sub = observable.subscribe(options)
        vm._apolloSubscriptions.push(sub)
        return sub
      }
    }
  }

  get mutate () {
    return this.client.mutate
  }

  option (key, options, watch) {
    const vm = this.vm
    const $apollo = this

    let query, sub

    const {
      forceFetch,
      pollInterval,
      returnPartialData,
      fragments,
      loadingKey
    } = options

    let { loadingChangeCb } = options

    if (typeof loadingChangeCb === 'function') {
      loadingChangeCb = loadingChangeCb.bind(vm)
    }

    let firstLoadingDone = false

    if (options.query) {
      query = options.query
    } else {
      query = options
    }

    if (typeof options.variables === 'function') {
      vm.$watch(options.variables.bind(vm), q, {
        immediate: true
      })
    } else {
      q(options.variables)
    }

    function nextResult ({ data }) {
      applyData(data)
    }

    function sendingError (err) {
      error(err)
    }

    function applyData (data) {
      loadingDone()

      if (typeof options.update === 'function') {
        vm.$set(key, options.update.call(vm, data))
      } else if (data[key] === undefined) {
        console.error(`Missing ${key} attribute on result`, data)
      } else {
        vm.$set(key, data[key])
      }

      if (typeof options.result === 'function') {
        options.result.call(vm, data)
      }
    }

    function applyLoadingModifier (value) {
      if (loadingKey) {
        vm.$set(loadingKey, vm.$get(loadingKey) + value)
      }

      if (loadingChangeCb) {
        loadingChangeCb(value === 1, value)
      }
    }

    function loadingDone () {
      if (!firstLoadingDone) {
        applyLoadingModifier(-1)
        firstLoadingDone = true
      }
    }

    function error (error) {
      loadingDone()

      if (error.graphQLErrors && error.graphQLErrors.length !== 0) {
        console.error(`GraphQL execution errors for query ${query}`)
        for (const e of error.graphQLErrors) {
          console.error(e)
        }
      } else if (error.networkError) {
        console.error(`Error sending the query ${query}`, error.networkError)
      } else {
        console.error(error)
      }

      if (typeof options.error === 'function') {
        options.error(error)
      }
    }

    function q (variables) {
      applyLoadingModifier(1)
      if (watch) {
        if (sub) {
          sub.unsubscribe()
        }
        $apollo.querySubscriptions[key] = sub = $apollo.watchQuery({
          query,
          variables,
          forceFetch,
          pollInterval,
          returnPartialData,
          fragments
        }).subscribe({
          next: nextResult,
          error: sendingError
        })
      } else {
        $apollo.query({
          query,
          variables,
          forceFetch,
          fragments
        }).then(nextResult).catch(sendingError)
      }
    }
  }
}
