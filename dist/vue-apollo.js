/*!
 * Vue-Apollo v1.0.3
 * (c) 2016 Koala Huang
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('apollo-client'), require('lodash.merge'), require('graphql-tag')) :
  typeof define === 'function' && define.amd ? define(['apollo-client', 'lodash.merge', 'graphql-tag'], factory) :
  (factory(global.apolloClient,global.merge,global.gql));
}(this, function (apolloClient,merge,gql) { 'use strict';

  var apolloClient__default = apolloClient['default'];
  merge = 'default' in merge ? merge['default'] : merge;
  gql = 'default' in gql ? gql['default'] : gql;

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  if (global) {
    global['gql'] = gql;
  } else if (window) {
    window['gql'] = gql;
  }

  var apolloClientOptions = {};
  var apolloClient$1 = null;

  var VueApolloClient = function () {
    function VueApolloClient() {
      classCallCheck(this, VueApolloClient);
    }

    createClass(VueApolloClient, null, [{
      key: 'setOptions',
      value: function setOptions(options) {
        merge(apolloClientOptions, options);
        if (apolloClient$1) {
          console.warn('Options set after the apollo client has been created will not be applied.');
        }
      }
    }, {
      key: 'createClient',
      value: function createClient() {
        apolloClient$1 = new apolloClient__default(apolloClientOptions);
        return apolloClient$1;
      }
    }, {
      key: 'client',
      set: function set(value) {
        apolloClient$1 = value;
      },
      get: function get() {
        if (!apolloClient$1) {
          VueApolloClient.createClient();
        }
        return apolloClient$1;
      }
    }]);
    return VueApolloClient;
  }();



  var client = Object.freeze({
    VueApolloClient: VueApolloClient
  });

  var DollarApollo = function () {
    function DollarApollo(vm) {
      classCallCheck(this, DollarApollo);

      this.vm = vm;
      this.querySubscriptions = {};
    }

    createClass(DollarApollo, [{
      key: 'watchQuery',
      value: function watchQuery(options) {
        var vm = this.vm;
        var observable = this.client.watchQuery(options);

        return {
          observable: observable,
          subscribe: function subscribe(options) {
            var sub = observable.subscribe(options);
            vm._apolloSubscriptions.push(sub);
            return sub;
          }
        };
      }
    }, {
      key: 'option',
      value: function option(key, options, watch) {
        var vm = this.vm;
        var $apollo = this;

        var query = void 0,
            sub = void 0;

        var forceFetch = options.forceFetch;
        var pollInterval = options.pollInterval;
        var returnPartialData = options.returnPartialData;
        var fragments = options.fragments;
        var loadingKey = options.loadingKey;
        var loadingChangeCb = options.loadingChangeCb;


        if (typeof loadingChangeCb === 'function') {
          loadingChangeCb = loadingChangeCb.bind(vm);
        }

        var firstLoadingDone = false;

        if (options.query) {
          query = options.query;
        } else {
          query = options;
        }

        if (typeof options.variables === 'function') {
          vm.$watch(options.variables.bind(vm), q, {
            immediate: true
          });
        } else {
          q(options.variables);
        }

        function nextResult(_ref) {
          var data = _ref.data;

          applyData(data);
        }

        function sendingError(err) {
          error(err);
        }

        function applyData(data) {
          loadingDone();

          if (typeof options.update === 'function') {
            vm.$set(vm, key, options.update.call(vm, data));
          } else if (data[key] === undefined) {
            console.error('Missing ' + key + ' attribute on result', data);
          } else {
            vm.$set(vm, key, data[key]);
          }

          if (typeof options.result === 'function') {
            options.result.call(vm, data);
          }
        }

        function applyLoadingModifier(value) {
          if (loadingKey) {
            vm.$set(loadingKey, vm.$get(loadingKey) + value);
          }

          if (loadingChangeCb) {
            loadingChangeCb(value === 1, value);
          }
        }

        function loadingDone() {
          if (!firstLoadingDone) {
            applyLoadingModifier(-1);
            firstLoadingDone = true;
          }
        }

        function error(error) {
          loadingDone();

          if (error.graphQLErrors && error.graphQLErrors.length !== 0) {
            console.error('GraphQL execution errors for query ' + query);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = error.graphQLErrors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var e = _step.value;

                console.error(e);
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          } else if (error.networkError) {
            console.error('Error sending the query ' + query, error.networkError);
          } else {
            console.error(error);
          }

          if (typeof options.error === 'function') {
            options.error(error);
          }
        }

        function q(variables) {
          applyLoadingModifier(1);
          if (watch) {
            if (sub) {
              sub.unsubscribe();
            }
            $apollo.querySubscriptions[key] = sub = $apollo.watchQuery({
              query: query,
              variables: variables,
              forceFetch: forceFetch,
              pollInterval: pollInterval,
              returnPartialData: returnPartialData,
              fragments: fragments
            }).subscribe({
              next: nextResult,
              error: sendingError
            });
          } else {
            $apollo.query({
              query: query,
              variables: variables,
              forceFetch: forceFetch,
              fragments: fragments
            }).then(nextResult).catch(sendingError);
          }
        }
      }
    }, {
      key: 'client',
      get: function get() {
        return VueApolloClient.client;
      }
    }, {
      key: 'query',
      get: function get() {
        return this.client.query;
      }
    }, {
      key: 'mutate',
      get: function get() {
        return this.client.mutate;
      }
    }]);
    return DollarApollo;
  }();



  var plugin = Object.freeze({
    DollarApollo: DollarApollo
  });

  function mixin(Vue) {
    Vue.mixin({
      created: function created() {
        this._apolloSubscriptions = [];
        this.$apollo = new DollarApollo(this);

        var apollo = this.$options.apollo;
        if (apollo) {
          // One-time queries with $query(), called each time a Vue dependency is updated (using $watch)
          if (apollo.data) {
            for (var key in apollo.data) {
              this.$apollo.option(key, apollo.data[key], false);
            }
          }

          // Auto updating queries with $watchQuery(), re-called each time a Vue dependency is updated (using $watch)
          if (apollo.watch) {
            for (var _key in apollo.watch) {
              this.$apollo.option(_key, apollo.watch[_key], true);
            }
          }
        }
      },
      destroyed: function destroyed() {
        this.$apollo = null;
        this._apolloSubscriptions.forEach(function (sub) {
          return sub.unsubscribe();
        });
        this._apolloSubscriptions = [];
      }
    });
  }

  var Vue = void 0;

  function install(_Vue) {
    if (Vue) {
      console.error('[vue-apollo] already installed. Vue.use(VueApollo) should be called only once.');
      return;
    }
    Vue = _Vue;
    mixin(Vue);
  }

  if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
  }

  module.exports = Object.assign({ install: install }, apolloClient, plugin, client);

}));