<template>
  <div id="app">
    <div class="apollo">
      <h1>Apollo</h1>
      <div class="tags">
        <h2>Tags</h2>
        <div class="info">
          These tags are fetched from an apollo server.
        </div>
        <span class="tag" v-for="tag in tags"><a>{{tag.label}}</a></span>

        <form @submit.prevent="addTag">
          <input v-model="tagLabel" placeholder="Add a tag" />
        </form>
      </div>

      <hr />

      <div class="tests">
        <h2>Tests</h2>
        <div>
          <h3>Hello</h3>
          <p>
            {{hello}}
          </p>
        </div>
        <div>
          <h3>Ping</h3>
          <input v-model="pingInput" placeholder="Enter a message" />
          <p>
            {{pingMessage}}
          </p>
        </div>
      </div>
    </div>
    <transition name="fade" mode="out-in">
      <router-view class="view"></router-view>
    </transition>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  data: () => ({
    pingInput: '',
    tagLabel: '',
    hello: '',
    pingMessage: '',
    tags: []
  }),
  apollo: {
    data: {
      hello: gql`{hello}`,
      pingMessage: {
        query: gql`query PingMessage($message: String!) {
          ping(message: $message)
        }`,
        variables() {
          return {
              message: this.pingInput
          }
        },
        update(data) {
          console.log(data)
          return data.ping
        },
        result(data) {
          console.log("We got some result!")
        },
        error(errors, type) {
          console.error(`We've got ${errors.length} errors of type '${type}'`)
        }
      }
    },
    watch: {
      tags: {
        query: gql`{
          tags {
            id,
            label
          }
        }`,
        pollInterval: 300
      }
    }
  },
  methods: {
    addTag() {
      this.$apollo.mutate({
        mutation: gql`mutation AddTag($label: String!) {
          addTag(label: $label) {
            id,
            label
          }
        }`,
        variables: {
          label: this.tagLabel
        }
      }).then((data) => {
        console.log(data)
        this.tagLabel = '';
      }).catch((error) => {
        console.error(error)
      })
    }
  }
}
</script>

<style scoped lang="less">
.tags {
  margin-top: 32px;
  text-align: center;
  h2 {
    margin-bottom: 8px;
  }
}
.tag {
  display: inline-block;
  margin-right: 6px;
  margin-bottom: 6px;
  padding: 4px 6px;
  background: #40b883;
  border-radius: 3px;
  a {
    color: white;
  }
  &:hover {
    background: #a0ddc4;
  }
}
</style>