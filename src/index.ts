import { queryType, makeSchema, stringArg, objectType, idArg } from 'nexus'
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
    }),
    t.field('user', {
      type: 'User',
      nullable: true,
      args: {
        id: idArg({ required: true })
      },
      resolve: (_, { id }) => {
        return USERS.find(user => user.id === id)
      }
    })
  }
})

const User = objectType({
  name: 'User',
  definition(t) {
    t.id('id'),
    t.string('email'),
    t.string('name')
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