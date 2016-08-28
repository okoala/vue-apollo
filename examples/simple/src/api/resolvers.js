// Fake word generator
const faker = require('faker')

// Let's generate some tags
var id = 0
var tags = []
for (let i = 0; i < 42; i++) {
  addTag(faker.random.word())
}

function addTag (label) {
  const t = {
    id: id++,
    label
  }
  tags.push(t)
  return t
}

const resolvers = {
  Query: {
    tags (root, args, context) {
      console.log(`query tags '${tags}'`)
      return tags
    },
    hello (root, args, context) {
      console.log(`query hello`)
      return 'Hello world!'
    },
    ping (root, { message }, context) {
      console.log(`query ping '${message}'`)
      return `Answering ${message}`
    }
  },
  Mutation: {
    addTag (root, { label }, context) {
      console.log(`adding tag '${label}'`)
      return addTag(label)
    }
  }
}

module.exports = resolvers
