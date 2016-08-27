# Apollo in Vue

非官方的Apollo集成进Vue的实现，主要代码是从这里抽离出来。目前只在个人项目中使用，如果官方有正式实现，就用官方版本。以上~

[https://github.com/Akryum/meteor-vue-component](https://github.com/Akryum/meteor-vue-component)

## 安装

  ```npm install okoala/vue-apollo --save```

## 使用

### 配置


`ApolloClient` 实例在调用的时候会自动创建. [more in the apollo doc](http://docs.apollostack.com/apollo-client/index.html#ApolloClient).

```javascript
import { VueApollo } from 'okoala/vue-apollo'

VueApollo.setApolloClientOptions({
  shouldBatch: true
})
```

访问 `ApolloClient` 实例:

```javascript
console.log(VueApollo.client)
```

动态改变 options：

```javascript
import ApolloClient from 'apollo-client'

VueApollo.client = new ApolloClient(options)
```

### 在组件中使用

```javascript
new Vue({
    apollo: {
      // Apollo specific options
    }
});
```

你可以通过 `this.$apollo.client` 获取 [apollo-client](http://docs.apollostack.com/apollo-client/index.html) 实例.

```javascript
user (root, args, context) {
  // 只返回匹配上用户id的数据
  if (context.user._id === args.id) {
    return context.user
  }
}
```

### Queries

In the `data` object, add an attribute for each property you want to feed with the result of an Apollo query.

#### Simple query

Put the [gql](http://docs.apollostack.com/apollo-client/core.html#gql) query directly as the value:

```javascript
apollo: {
  // Non-reactive query
  data: {
    // Simple query that will update the 'hello' vue property
    hello: gql`{hello}`
  }
}
```

不要忘记初始化数据，这样才能正常进行监控:

```javascript
data () {
  return {
    hello: ''
  }
}
```

服务段，添加对应的schema和resolvers：

```javascript
export const schema = `
type Query {
  hello: String
}

schema {
  query: Query
}
`

export const resolvers = {
  Query: {
    hello(root, args, context) {
      return "Hello world!"
    }
  }
}
```

更多信息, 请访问 [apollo doc](http://docs.apollostack.com/apollo-server/index.html).

好了，这样在模块里面可以正常获取到数据了:

```html
<template>
  <div class="apollo">
    <h3>Hello</h3>
    <p>
      {{hello}}
    </p>
  </div>
</template>
```

#### Query with parameters

You can add variables (read parameters) to your `gql` query by declaring `query` and `variables` in an object:

```javascript
// Apollo-specific options
apollo: {
  // Non-reactive query
  data: {
    // Query with parameters
    ping: {
      // gql query
      query: gql`query PingMessage($message: String!) {
        ping(message: $message)
      }`,
      // Static parameters
      variables: {
        message: 'Meow'
      }
    }
  }
}
```

你可以在apollo options中使用下面对象:
 - `forceFetch`
 - `fragments`

更多信息, 请访问 [apollo doc](http://docs.apollostack.com/apollo-client/queries.html#query).

例如, 你可以添加 `forceFetch`:

```javascript
apollo: {
  data: {
    // Query with parameters
    ping: {
      query: gql`query PingMessage($message: String!) {
        ping(message: $message)
      }`,
      variables: {
        message: 'Meow'
      },
      forceFetch: true
    }
  }
}
```

```javascript
data () {
  return {
    // Initialize your apollo data
    ping: ''
  }
}
```

```javascript
export const schema = `
type Query {
  ping(message: String!): String
}

schema {
  query: Query
}
`

export const resolvers = {
  Query: {
    ping(root, { message }, context) {
      return `Answering ${message}`
    }
  }
}
```

```html
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <p>
      {{ping}}
    </p>
  </div>
</template>
```

#### Reactive parameters

Use a function instead to make the parameters reactive with vue properties:

```javascript
// Apollo-specific options
apollo: {
  // Non-reactive query
  data: {
    // Query with parameters
    ping: {
      query: gql`query PingMessage($message: String!) {
        ping(message: $message)
      }`,
      // Reactive parameters
      variables() {
        // Use vue reactive properties here
        return {
            message: this.pingInput
        }
      }
    }
  }
}
```

This will re-fetch the query each time a parameter changes, for example:

```html
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <input v-model="pingInput" placeholder="Enter a message" />
    <p>
      {{ping}}
    </p>
  </div>
</template>
```

#### Advanced options

These are the available advanced options you can use:
- `update(data) {return ...}` to customize the value that is set in the vue property, for example if the field names don't match
- `result(data)` is a hook called when a result is received
- `error(errors, type)` is a hook called when there are errors, `type` value can either be `'sending'` or `'execution'`
- `loadingKey` will update the component data property you pass as the value. You should initialize this property to `0` in the component `data()` hook. When the query is loading, this property will be incremented by 1 and as soon as it no longer is, the property will be decremented by 1. That way, the property can represent a counter of currently loading queries.
- `watchLoading(isLoading, countModifier)` is a hook called when the loading state of the query changes. The `countModifier` parameter is either equal to `1` when the query is now loading, or `-1` when the query is no longer loading.


```javascript
// Apollo-specific options
apollo: {
  // Non-reactive query
  data: {
    // Advanced query with parameters
    // The 'variables' method is watched by vue
    pingMessage: {
      query: gql`query PingMessage($message: String!) {
        ping(message: $message)
      }`,
      // Reactive parameters
      variables() {
        // Use vue reactive properties here
        return {
            message: this.pingInput
        }
      },
      // We use a custom update callback because
      // the field names don't match
      // By default, the 'pingMessage' attribute
      // would be used on the 'data' result object
      // Here we know the result is in the 'ping' attribute
      // considering the way the apollo server works
      update(data) {
        console.log(data)
        // The returned value will update
        // the vue property 'pingMessage'
        return data.ping
      },
      // Optional result hook
      result(data) {
        console.log("We got some result!")
      },
      // Error handling
      error(errors, type) {
        console.error(`We've got ${errors.length} errors of type '${type}'`)
      },
      // Loading state
      // loadingKey is the name of the data property
      // that will be incremented when the query is loading
      // and decremented when it no longer is.
      loadingKey: 'loadingQueriesCount',
      // watchLoading will be called whenever the loading state changes
      watchLoading(isLoading, countModifier) {
        // isLoading is a boolean
        // countModifier is either 1 or -1
      }
    }
  }
}
```

### Reactive Queries

*For now, the reactivity in apollo is quite limited, since you can only do polling.*

For more info, see the [apollo doc](http://docs.apollostack.com/apollo-client/core.html#watchQuery).

Add your queries in a `watch` object instead of `data`:

```javascript
// Apollo-specific options
apollo: {
  // Reactive query
  watch: {
    // 'tags' data property on vue instance
    tags: {
      query: gql`{
        tags {
          id,
          label
        }
      }`,
      pollInterval: 300 // ms
    }
  }
}
```

You can use the following apollo options:
 - `forceFetch`
 - `returnPartialData`
 - `pollInterval`
 - `fragments`

See the [apollo doc](http://docs.apollostack.com/apollo-client/queries.html#watchQuery) for more details.

You can also use the advanced options detailed above, like `result` or `watchLoading`.

Here is how the server-side looks like:

```javascript
export const schema = `
type Tag {
  id: Int
  label: String
}

type Query {
  tags: [Tag]
}

schema {
  query: Query
}
`;

// Fake word generator
import casual from 'casual';

// Let's generate some tags
var id = 0;
var tags = [];
for (let i = 0; i < 42; i++) {
  addTag(casual.word);
}

function addTag(label) {
  let t = {
    id: id++,
    label
  };
  tags.push(t);
  return t;
}

export const resolvers = {
  Query: {
    tags(root, args, context) {
      return tags;
    }
  }
};
```

### Mutations

Mutations are queries that changes your data state on your apollo server. For more info, visit the [apollo doc](http://docs.apollostack.com/apollo-client/core.html#Mutations).

```javascript
methods: {
  addTag() {
    // Mutate the tags data
    // You can also use this.$apollo.client.mutate
    this.$apollo.mutate({
      mutation: gql`mutation AddTag($label: String!) {
        addTag(label: $label) {
          id,
          label
        }
      }`,
      // Parameters
      variables: {
        label: this.tagLabel
      }
    }).then((data) => {
      // Result
      console.log(data);
      this.tagLabel = '';
    }).catch((error) => {
      // Error
      console.error(error);
    });
  }
}
```

Server-side:

```javascript
export const schema = `
type Tag {
  id: Int
  label: String
}

type Query {
  tags: [Tag]
}

type Mutation {
  addTag(label: String!): Tag
}

schema {
  query: Query
  mutation: Mutation
}
`;

// Fake word generator
import faker from 'faker';

// Let's generate some tags
var id = 0;
var tags = [];
for (let i = 0; i < 42; i++) {
  addTag(faker.random.word());
}

function addTag(label) {
  let t = {
    id: id++,
    label
  };
  tags.push(t);
  return t;
}

export const resolvers = {
  Query: {
    tags(root, args, context) {
      return tags;
    }
  },
  Mutation: {
    addTag(root, { label }, context) {
      console.log(`adding tag '${label}'`);
      return addTag(label);
    }
  }
};
```

---

