import ApolloClient from 'apollo-client'
import merge from 'lodash.merge'

import gql from 'graphql-tag'

if (global) {
  global['gql'] = gql
} else if (window) {
  window['gql'] = gql
}

const apolloClientOptions = {}
let apolloClient = null

export class VueApolloClient {
  static setOptions (options) {
    merge(apolloClientOptions, options)
    if (apolloClient) {
      console.warn('Options set after the apollo client has been created will not be applied.')
    }
  }

  static createClient () {
    apolloClient = new ApolloClient(apolloClientOptions)
    return apolloClient
  }

  static set client (value) {
    apolloClient = value
  }

  static get client () {
    if (!apolloClient) {
      VueApolloClient.createClient()
    }
    return apolloClient
  }
}

