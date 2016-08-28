import ApolloClient from 'apollo-client'
import _ from 'lodash'

// import gql from 'graphql-tag'

// if (window) {
//   window['gql'] = gql
// } else if (self) {
//   self['gql'] = gql
// }

const apolloClientOptions = {}
let apolloClient = null

export class VueApolloClient {
  static setOptions (options) {
    _.merge(apolloClientOptions, options)
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

