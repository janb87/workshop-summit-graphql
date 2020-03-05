import { queryType, makeSchema, stringArg, objectType } from 'nexus'
import { ApolloServer } from 'apollo-server'
import { USERS } from './db/users'

const Query = queryType({
  definition(t) {
    t.field('hello', {
      type: 'String',
      args: {
        name: stringArg()
      },
      resolve: (_, args) => `Hello ${args.name || 'Nexus'}`
    }),
    t.field('users', {
      type: 'User',
      list: true,
      nullable: true,
      resolve: () => {
        return USERS
      }
    })
  }
})

const User = objectType({
  name: 'User',
  definition(t) {
    t.id('id'),
    t.string('email', {
      nullable: true
    }),
    t.string('name', {
      nullable: true
    })
  }
})

const schema = makeSchema({
  types: [Query, User],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/types.ts'
  }
})

const server = new ApolloServer({
  schema
})
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})