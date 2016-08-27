const { makeExecutableSchema } = require('graphql-tools')
const schema = require('./schema')
const resolvers = require('./resolvers')

module.exports = makeExecutableSchema({
  typeDefs: [
    ...schema
  ],
  resolvers
})
